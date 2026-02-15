import { NextResponse } from 'next/server'
// @ts-ignore - nodemailer types not installed
import { createTransport } from 'nodemailer'
import { encode } from 'next-auth/jwt'

export async function POST(req: Request) {
  try {
    const { email, callbackUrl } = await req.json()
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const secret = process.env.NEXTAUTH_SECRET || 'debtcrusher-secret-key-change-in-production'
    const baseUrl = process.env.NEXTAUTH_URL || 'https://debtcrusher.ai'

    // Create a signed token (15 min expiry)
    const token = await encode({
      secret,
      token: {
        email,
        purpose: 'magic-link',
        exp: Math.floor(Date.now() / 1000) + 15 * 60,
      },
      maxAge: 15 * 60,
    })

    const verifyUrl = `${baseUrl}/api/auth/verify-magic?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl || '/')}`

    // Send email
    const transport = createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER || '',
        pass: process.env.EMAIL_SERVER_PASSWORD || '',
      },
    })

    await transport.sendMail({
      from: `"DebtCrusher" <${process.env.EMAIL_FROM || 'support@debtcrusher.ai'}>`,
      to: email,
      subject: 'Sign in to DebtCrusher',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#111827;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:28px;">⚡ DebtCrusher</h1>
          </div>
          <div style="padding:32px;color:#d1d5db;">
            <p style="font-size:16px;margin-bottom:24px;">Click the button below to sign in to your DebtCrusher account:</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${verifyUrl}" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
                Sign In to DebtCrusher
              </a>
            </div>
            <p style="font-size:13px;color:#6b7280;margin-top:24px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #374151;margin:24px 0;">
            <p style="font-size:12px;color:#4b5563;text-align:center;">
              DebtCrusher.ai — Crush Your Debt. Fix Your Credit.
            </p>
          </div>
        </div>
      `,
      text: `Sign in to DebtCrusher: ${verifyUrl}\n\nThis link expires in 15 minutes.`,
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Magic link send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
