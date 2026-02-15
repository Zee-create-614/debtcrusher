'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
          <p className="text-gray-400">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          {error === 'Configuration' && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>For MVP:</strong> Email authentication requires SMTP configuration. 
                Please use the simple email sign-in method instead.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="/auth/signin"
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Try Again
            </a>
            
            <a
              href="/"
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition-colors text-center block"
            >
              Go Home
            </a>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>
              If the problem persists, contact{' '}
              <a 
                href="mailto:support@debtcrusher.ai" 
                className="text-green-400 hover:text-green-300"
              >
                support@debtcrusher.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}