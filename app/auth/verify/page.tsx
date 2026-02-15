'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white">Verifying...</div></div>}>
      <VerifyInner />
    </Suspense>
  )
}

function VerifyInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    if (!token || !email) {
      setStatus('error')
      return
    }

    signIn('magic-link', {
      email,
      token,
      callbackUrl,
      redirect: true,
    }).catch(() => setStatus('error'))
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        {status === 'verifying' ? (
          <>
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Signing you in...</p>
          </>
        ) : (
          <>
            <p className="text-red-400 text-lg mb-4">Link expired or invalid</p>
            <a href="/auth/signin" className="text-green-400 hover:text-green-300">Request a new sign-in link →</a>
          </>
        )}
      </div>
    </div>
  )
}
