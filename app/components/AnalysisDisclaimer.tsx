'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface AnalysisDisclaimerProps {
  onConsentChange: (consented: boolean) => void
  isConsented: boolean
}

export default function AnalysisDisclaimer({ onConsentChange, isConsented }: AnalysisDisclaimerProps) {
  const handleConsentChange = (checked: boolean) => {
    onConsentChange(checked)
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-400 mb-2">Important Legal Disclaimer</h3>
          <div className="text-sm text-gray-300 space-y-2 mb-4">
            <p>
              <strong>DebtCrusher.ai provides educational tools and templates, not legal advice.</strong> 
              We are not a law firm, attorney, or legal service provider.
            </p>
            <p>
              By proceeding, you acknowledge that:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>You voluntarily upload your information for analysis</li>
              <li>All letter templates should be reviewed before sending</li>
              <li>You are responsible for your own legal decisions</li>
              <li>Results are educational and not guaranteed</li>
              <li>You should consult an attorney for complex legal matters</li>
            </ul>
            <p>
              You also agree to our{' '}
              <a href="/terms" className="text-green-400 hover:text-green-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-400 hover:text-green-300 underline">
                Privacy Policy
              </a>.
            </p>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isConsented}
              onChange={(e) => handleConsentChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300 flex-1">
              <strong>I understand and agree.</strong> I acknowledge that DebtCrusher.ai provides educational 
              tools and templates, not legal advice. I voluntarily upload this information and agree 
              to the Terms of Service and Privacy Policy.
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}