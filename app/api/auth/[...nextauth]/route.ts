import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'debtcrusher-secret-key-change-in-production',
  providers: [
    // Credentials provider for MVP (no password needed)
    CredentialsProvider({
      id: 'email-only',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your-email@example.com' }
      },
      async authorize(credentials) {
        if (credentials?.email) {
          // For MVP, just accept any email without verification
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
          }
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