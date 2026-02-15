'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { Calendar, DollarSign, FileText, Mail, Download, Trash2, Clock, CheckCircle } from 'lucide-react'

interface Analysis {
  id: string
  type: 'bill' | 'credit'
  date: string
  summary: string
  savingsFound?: number
  itemsDisputed?: number
  lettersSent?: string[]
  letterStatus?: string
  refundEligible?: boolean
  refundDeadline?: string
  results?: any
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin')
    }

    if (session?.user?.email) {
      fetchAnalyses()
    }
  }, [session, status])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/user/analyses')
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses)
      }
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRemainingDays = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const downloadData = () => {
    const data = {
      email: session?.user?.email,
      analyses: analyses,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'debtcrusher-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // For MVP, we'll just sign out and clear local data
      alert('Account deletion feature will be available soon. For now, please contact support@debtcrusher.ai')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Account</h1>
          <p className="text-gray-300 flex items-center gap-2">
            <Mail size={18} />
            {session?.user?.email}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} />
                <span className="text-sm text-gray-300">Total Analyses</span>
              </div>
              <span className="text-2xl font-bold">{analyses.length}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} />
                <span className="text-sm text-gray-300">Total Savings Found</span>
              </div>
              <span className="text-2xl font-bold">
                ${analyses.reduce((sum, a) => sum + (a.savingsFound || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} />
                <span className="text-sm text-gray-300">Items Disputed</span>
              </div>
              <span className="text-2xl font-bold">
                {analyses.reduce((sum, a) => sum + (a.itemsDisputed || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Analyses</h2>
          {analyses.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No analyses yet. Start by analyzing a bill or credit report.</p>
              <div className="mt-4 space-x-4">
                <a
                  href="/analyze"
                  className="inline-block bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors"
                >
                  Analyze Medical Bill
                </a>
                <a
                  href="/credit-repair"
                  className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
                >
                  Credit Repair
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {analysis.type === 'bill' ? (
                          <>
                            <FileText size={18} />
                            Medical Bill Analysis
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Credit Repair Analysis
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2 mt-1">
                        <Calendar size={14} />
                        {formatDate(analysis.date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      analysis.refundEligible 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {analysis.refundEligible ? 'Refund Eligible' : 'No Refund'}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-3">{analysis.summary}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {analysis.savingsFound && (
                      <div>
                        <span className="text-sm text-gray-400">Savings Found</span>
                        <p className="font-semibold text-green-400">
                          ${analysis.savingsFound.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {analysis.itemsDisputed && (
                      <div>
                        <span className="text-sm text-gray-400">Items Disputed</span>
                        <p className="font-semibold">{analysis.itemsDisputed}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-400">Letters Sent</span>
                      <p className="font-semibold">{analysis.lettersSent?.length || 0}</p>
                    </div>
                    {analysis.refundDeadline && analysis.refundEligible && (
                      <div>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          Refund Deadline
                        </span>
                        <p className="font-semibold text-yellow-400">
                          {getRemainingDays(analysis.refundDeadline)} days left
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/results?id=${analysis.id}`}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition-colors"
                    >
                      View Results
                    </a>
                    <a
                      href={`/verify?id=${analysis.id}`}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Verify Results
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <button
              onClick={downloadData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={18} />
              Download My Data
            </button>
            <button
              onClick={deleteAccount}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
            <div className="text-sm text-gray-400 mt-4">
              <p><strong>Note for MVP:</strong> Account data is stored locally in your browser. 
              For permanent storage and cross-device sync, please check back for our full version launch.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}