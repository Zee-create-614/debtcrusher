'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SignInInner />
    </Suspense>
  )
}

function SignInInner() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
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
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackUrl }),
      })

      if (!res.ok) {
        setError('Failed to send sign-in link. Please try again.')
      } else {
        setSent(true)
        // Track signup
        try {
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "user_signup",
              data: { email, method: "magic-link" },
              timestamp: new Date().toISOString()
            })
          });
        } catch {}
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-gray-400 mb-2">
            We sent a sign-in link to
          </p>
          <p className="text-green-400 font-medium mb-6">{email}</p>
          <p className="text-gray-500 text-sm mb-6">
            Click the link in the email to sign in. It may take a minute to arrive. Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to DebtCrusher</h1>
          <p className="text-gray-400">Sign in to save your analyses and track your progress</p>
        </div>

        <div className="space-y-6">
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-200 font-medium text-sm mb-1">No Password Needed</p>
                <p className="text-gray-300 text-sm">
                  We'll send you a secure sign-in link. No password to remember!
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
              {loading ? 'Sending link...' : 'Send Sign-In Link'}
            </button>
          </form>

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
