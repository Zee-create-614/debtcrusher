import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createTransport } from 'nodemailer'
import * as jwt from 'next-auth/jwt'

// Simple magic link flow:
// 1. User enters email on /auth/signin
// 2. We send a signed magic link via /api/auth/magic
// 3. User clicks link → /api/auth/verify-magic decodes token → signs in via credentials

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'debtcrusher-secret-key-change-in-production',
  providers: [
    CredentialsProvider({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        email: { label: 'Email', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) return null
        
        try {
          // Verify the magic token
          const secret = process.env.NEXTAUTH_SECRET || 'debtcrusher-secret-key-change-in-production'
          const decoded = await jwt.decode({ token: credentials.token, secret })
          
          if (decoded?.email === credentials.email && decoded?.purpose === 'magic-link') {
            // Check expiry (15 min)
            const exp = decoded.exp as number
            if (exp && Date.now() / 1000 > exp) return null
            
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
            }
          }
        } catch (err) {
          console.error('Magic link verification failed:', err)
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token.email && session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
