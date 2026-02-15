'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('debtcrusher-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('debtcrusher-consent', 'accepted')
    localStorage.setItem('debtcrusher-consent-date', new Date().toISOString())
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('debtcrusher-consent', 'declined')
    localStorage.setItem('debtcrusher-consent-date', new Date().toISOString())
    setIsVisible(false)
    // For MVP, we don't block usage but track the decline
    alert('You have declined cookies. Some features may not work properly. You can change this in your browser settings.')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            We use cookies and local storage to save your preferences and analysis data. 
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-green-400 hover:text-green-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-green-400 hover:text-green-300 underline">
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}