'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    // Check if already signed in
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [callbackUrl, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      // Use credentials provider for MVP (no email verification)
      const result = await signIn('email-only', {
        email: email,
        redirect: false,
      })

      if (result?.error) {
        setError('Sign in failed. Please try again.')
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Try email provider (magic link)
      const result = await signIn('email', {
        email: email,
        callbackUrl: callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Email sign-in is not configured yet. Please use simple sign-in instead.')
      } else {
        alert('Check your email for a sign-in link!')
      }
    } catch (err) {
      console.error('Email sign in error:', err)
      setError('Email sign-in is not available yet. Please use simple sign-in instead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access your account and saved analyses</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-200 font-medium text-sm mb-1">MVP Notice</p>
                <p className="text-gray-300 text-sm">
                  For the MVP, we use simple email-based accounts with no password required. 
                  Just enter your email and you're signed in!
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In (MVP - No Password)'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleEmailSignIn}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Send Magic Link (Requires SMTP Setup)
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Just enter your email above!
              </button>
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>By signing in, you agree to our</p>
            <p>
              <a href="/terms" className="text-green-400 hover:text-green-300">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-green-400 hover:text-green-300">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}