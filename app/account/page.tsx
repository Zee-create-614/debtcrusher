'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { Calendar, DollarSign, FileText, Mail, Download, Trash2, Clock, CheckCircle, Upload, TrendingUp, Plus } from 'lucide-react'

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

interface CreditScore {
  id: string
  score: number
  date: string
  provider: string
  notes?: string
}

interface BureauResponse {
  id: string
  fileName: string
  uploadDate: string
  fileSize: number
  status: 'pending' | 'processed'
  analysisNotes?: string
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [creditScores, setCreditScores] = useState<CreditScore[]>([])
  const [bureauResponses, setBureauResponses] = useState<BureauResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'letters' | 'history' | 'payments' | 'responses' | 'scores'>('overview')
  
  // Credit Score Tracker state
  const [newScore, setNewScore] = useState('')
  const [newProvider, setNewProvider] = useState('Credit Karma')
  const [newNotes, setNewNotes] = useState('')
  const [isAddingScore, setIsAddingScore] = useState(false)

  // File upload state
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin')
    }

    if (session?.user?.email) {
      fetchAnalyses()
      loadCreditScores()
      loadBureauResponses()
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

  const loadCreditScores = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem(`creditScores_${session?.user?.email}`)
    if (saved) {
      try {
        setCreditScores(JSON.parse(saved))
      } catch (e) {
        setCreditScores([])
      }
    }
  }

  const loadBureauResponses = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem(`bureauResponses_${session?.user?.email}`)
    if (saved) {
      try {
        setBureauResponses(JSON.parse(saved))
      } catch (e) {
        setBureauResponses([])
      }
    }
  }

  const saveCreditScores = (scores: CreditScore[]) => {
    localStorage.setItem(`creditScores_${session?.user?.email}`, JSON.stringify(scores))
    setCreditScores(scores)
  }

  const saveBureauResponses = (responses: BureauResponse[]) => {
    localStorage.setItem(`bureauResponses_${session?.user?.email}`, JSON.stringify(responses))
    setBureauResponses(responses)
  }

  const addCreditScore = () => {
    if (!newScore || isNaN(Number(newScore))) return

    const score: CreditScore = {
      id: Date.now().toString(),
      score: Number(newScore),
      date: new Date().toISOString(),
      provider: newProvider,
      notes: newNotes
    }

    const updatedScores = [...creditScores, score].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    saveCreditScores(updatedScores)
    
    setNewScore('')
    setNewNotes('')
    setIsAddingScore(false)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create a mock upload - in production this would upload to a server
        const response: BureauResponse = {
          id: Date.now().toString() + i,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          status: 'pending',
        }
        
        const updatedResponses = [response, ...bureauResponses]
        saveBureauResponses(updatedResponses)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRemainingDays = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const downloadLettersPDF = (analysis: Analysis) => {
    if (!analysis.results?.items) return
    
    const letters: any[] = []
    analysis.results.items.forEach((item: any) => {
      if (item.dispute_letters) {
        Object.entries(item.dispute_letters).forEach(([bureau, content]) => {
          if (content) {
            letters.push({
              title: `${item.account} - ${bureau.charAt(0).toUpperCase() + bureau.slice(1)} Dispute`,
              content: content
            })
          }
        })
      }
      if (item.goodwill_letter) {
        letters.push({
          title: `${item.account} - Goodwill Letter`,
          content: item.goodwill_letter
        })
      }
      if (item.pay_for_delete_letter) {
        letters.push({
          title: `${item.account} - Pay for Delete`,
          content: item.pay_for_delete_letter
        })
      }
    })

    if (letters.length === 0) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Dispute Letters - ${formatDate(analysis.date)}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #000;
            }
            .letter { 
              page-break-after: always; 
              margin-bottom: 40px; 
            }
            .letter:last-child {
              page-break-after: auto;
            }
            .letter-title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 30px; 
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .letter-content { 
              white-space: pre-wrap; 
              font-size: 12pt; 
            }
            @media print {
              body { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          ${letters.map(letter => `
            <div class="letter">
              <div class="letter-title">${letter.title}</div>
              <div class="letter-content">${letter.content}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const downloadData = () => {
    const data = {
      email: session?.user?.email,
      analyses: analyses,
      creditScores: creditScores,
      bureauResponses: bureauResponses,
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
        <div className="max-w-6xl mx-auto">
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

  const creditAnalyses = analyses.filter(a => a.type === 'credit')
  const billAnalyses = analyses.filter(a => a.type === 'bill')

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-300 flex items-center gap-2">
            <Mail size={18} />
            {session?.user?.email}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-1 rounded-lg">
            {[
              { key: 'overview', label: 'Overview', icon: CheckCircle },
              { key: 'letters', label: 'My Dispute Letters', icon: FileText },
              { key: 'history', label: 'Dispute History', icon: Calendar },
              { key: 'payments', label: 'Payment History', icon: DollarSign },
              { key: 'responses', label: 'Bureau Responses', icon: Upload },
              { key: 'scores', label: 'Credit Score Tracker', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} />
                  <span className="text-sm text-gray-300">Total Analyses</span>
                </div>
                <span className="text-2xl font-bold">{analyses.length}</span>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} />
                  <span className="text-sm text-gray-300">Total Savings Found</span>
                </div>
                <span className="text-2xl font-bold">
                  ${analyses.reduce((sum, a) => sum + (a.savingsFound || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} />
                  <span className="text-sm text-gray-300">Items Disputed</span>
                </div>
                <span className="text-2xl font-bold">
                  {analyses.reduce((sum, a) => sum + (a.itemsDisputed || 0), 0)}
                </span>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-sm text-gray-300">Latest Credit Score</span>
                </div>
                <span className="text-2xl font-bold">
                  {creditScores.length > 0 ? creditScores[0].score : '--'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/analyze"
                  className="bg-green-600 hover:bg-green-500 px-4 py-3 rounded-lg transition-colors text-center font-medium"
                >
                  🏥 Analyze Medical Bill
                </a>
                <a
                  href="/credit-repair"
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg transition-colors text-center font-medium"
                >
                  📊 Credit Repair Analysis
                </a>
                <a
                  href="/verify"
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-3 rounded-lg transition-colors text-center font-medium"
                >
                  🔍 Verify Results
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'letters' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">My Dispute Letters</h2>
            {creditAnalyses.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No dispute letters yet.</p>
                <a
                  href="/credit-repair"
                  className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors mt-4"
                >
                  Start Credit Repair Analysis
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {creditAnalyses.map((analysis) => (
                  <div key={analysis.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <FileText size={18} />
                          Credit Repair Letters - {formatDate(analysis.date)}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {analysis.itemsDisputed} items disputed
                        </p>
                      </div>
                      <button
                        onClick={() => downloadLettersPDF(analysis)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm">{analysis.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Dispute History</h2>
            {analyses.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No analysis history yet.</p>
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
                        {analysis.refundEligible ? 'Active' : 'Completed'}
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
                        <span className="text-sm text-gray-400">Status</span>
                        <p className="font-semibold">{analysis.letterStatus || 'Generated'}</p>
                      </div>
                      {analysis.refundDeadline && analysis.refundEligible && (
                        <div>
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            Days Remaining
                          </span>
                          <p className="font-semibold text-yellow-400">
                            {getRemainingDays(analysis.refundDeadline)} days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            <div className="text-center text-gray-400 py-12">
              <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
              <p>Payment history will be shown here.</p>
              <p className="text-sm mt-2">This feature tracks your purchases and payments made through DebtCrusher.ai</p>
            </div>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Bureau Response</h2>
            <p className="text-gray-300 mb-6">
              Upload correspondence from credit bureaus for follow-up analysis and next steps.
            </p>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-400 mb-4">
                Support for PDF, DOC, DOCX, JPG, PNG files up to 10MB
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block"
              >
                {uploading ? 'Uploading...' : 'Choose Files'}
              </label>
            </div>

            {/* Uploaded Files List */}
            {bureauResponses.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                  {bureauResponses.map((response) => (
                    <div key={response.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{response.fileName}</h4>
                        <p className="text-sm text-gray-400">
                          {formatDate(response.uploadDate)} • {formatFileSize(response.fileSize)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          response.status === 'processed' 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {response.status === 'processed' ? 'Processed' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Credit Score Tracker</h2>
              <button
                onClick={() => setIsAddingScore(true)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Score
              </button>
            </div>

            {/* Add Score Form */}
            {isAddingScore && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-4">Add New Credit Score</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Credit Score</label>
                    <input
                      type="number"
                      min="300"
                      max="850"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                      placeholder="e.g. 720"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <select
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="Credit Karma">Credit Karma</option>
                      <option value="Experian">Experian</option>
                      <option value="Equifax">Equifax</option>
                      <option value="TransUnion">TransUnion</option>
                      <option value="FICO">FICO</option>
                      <option value="Credit Sesame">Credit Sesame</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                      placeholder="e.g. After dispute letters"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={addCreditScore}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Add Score
                  </button>
                  <button
                    onClick={() => setIsAddingScore(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Score History */}
            {creditScores.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No credit scores tracked yet.</p>
                <p className="text-sm mt-2">Start logging your credit score to track improvement over time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {creditScores.map((score, index) => {
                  const previousScore = creditScores[index + 1]
                  const change = previousScore ? score.score - previousScore.score : null
                  
                  return (
                    <div key={score.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold">{score.score}</span>
                          {change !== null && (
                            <span className={`text-sm font-semibold ${
                              change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {change > 0 ? '+' : ''}{change} pts
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">
                          {score.provider} • {formatDate(score.date)}
                        </p>
                        {score.notes && (
                          <p className="text-sm text-gray-400 mt-1">{score.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Account Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
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
          </div>
        </div>
      </div>
    </div>
  )
}