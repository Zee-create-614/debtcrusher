import { NextResponse } from 'next/server'

// This page redirects to the signin page with the token pre-filled
// The signin page then calls signIn('magic-link', { email, token })
export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const email = url.searchParams.get('email') || ''
  const callbackUrl = url.searchParams.get('callbackUrl') || '/'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://debtcrusher.ai'

  // Redirect to a page that auto-signs in
  const params = new URLSearchParams({ token, email, callbackUrl })
  return NextResponse.redirect(`${baseUrl}/auth/verify?${params.toString()}`)
}
