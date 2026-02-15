'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  overview: {
    totalAnalyses: number
    totalUsers: number
    totalLetters: number
    totalRevenue: number
    conversionRate: number
  }
  charts: {
    dailyAnalyses: { date: string; count: number }[]
    dailyRevenue: { date: string; revenue: number }[]
    debtTypes: { [key: string]: number }
    states: { [key: string]: number }
    analysisTypes: { bill: number; credit: number }
  }
  recentActivity: {
    analyses: Array<{
      timestamp: string
      type: string
      amount: number
      state: string
      savingsFound: number
    }>
    signups: Array<{
      email: string
      timestamp: string
    }>
    letters: Array<{
      type: string
      status: string
      timestamp: string
    }>
  }
  users: Array<{
    email: string
    signupDate: string | null
    analysesCount: number
    lettersSent: number
    totalPaid: number
    analyses: Array<{
      timestamp: string
      type: string
      amount: number
      state: string
      savingsFound: number
    }>
  }>
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if already authenticated on mount
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true'
    if (isAuth) {
      setIsAuthenticated(true)
      fetchAnalytics()
    }
  }, [])

  // Auto-refresh every 30 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchAnalytics()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const authenticate = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'x-admin-password': password
        }
      })

      if (response.ok) {
        localStorage.setItem('admin_authenticated', 'true')
        setIsAuthenticated(true)
        const data = await response.json()
        setAnalyticsData(data.data)
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('Authentication failed')
    }
    
    setLoading(false)
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'x-admin-password': localStorage.getItem('admin_password') || 'crusher2026'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      } else if (response.status === 401) {
        localStorage.removeItem('admin_authenticated')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_password')
    setIsAuthenticated(false)
    setPassword('')
  }

  const exportCSV = () => {
    if (!analyticsData) return

    const csvData = analyticsData.users.map(user => ({
      email: user.email,
      signupDate: user.signupDate,
      analysesCount: user.analysesCount,
      lettersSent: user.lettersSent,
      totalPaid: user.totalPaid
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debtcrusher-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                localStorage.setItem('admin_password', e.target.value)
              }}
              onKeyDown={(e) => e.key === 'Enter' && authenticate()}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={authenticate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = analyticsData.users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedUserData = selectedUser 
    ? analyticsData.users.find(u => u.email === selectedUser)
    : null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">DebtCrusher Analytics Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Analyses</h3>
            <p className="text-3xl font-bold text-blue-400">{analyticsData.overview.totalAnalyses}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-green-400">{analyticsData.overview.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm">Letters Sent</h3>
            <p className="text-3xl font-bold text-purple-400">{analyticsData.overview.totalLetters}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-yellow-400">${analyticsData.overview.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm">Conversion Rate</h3>
            <p className="text-3xl font-bold text-orange-400">{analyticsData.overview.conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Analyses Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Analyses per Day (Last 30 days)</h3>
            <div className="space-y-2">
              {analyticsData.charts.dailyAnalyses.slice(-10).map((day, index) => {
                const maxCount = Math.max(...analyticsData.charts.dailyAnalyses.map(d => d.count))
                const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{day.date.split('-').slice(1).join('/')}</span>
                    <div className="flex-1 bg-gray-700 rounded h-4 relative">
                      <div 
                        className="bg-blue-500 h-full rounded transition-all duration-300"
                        style={{ width: `${width}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                        {day.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Revenue per Day (Last 30 days)</h3>
            <div className="space-y-2">
              {analyticsData.charts.dailyRevenue.slice(-10).map((day, index) => {
                const maxRevenue = Math.max(...analyticsData.charts.dailyRevenue.map(d => d.revenue))
                const width = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{day.date.split('-').slice(1).join('/')}</span>
                    <div className="flex-1 bg-gray-700 rounded h-4 relative">
                      <div 
                        className="bg-green-500 h-full rounded transition-all duration-300"
                        style={{ width: `${width}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                        ${day.revenue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Debt Types Pie Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Most Common Debt Types</h3>
            <div className="space-y-2">
              {Object.entries(analyticsData.charts.debtTypes).map(([type, count], index) => {
                const total = Object.values(analyticsData.charts.debtTypes).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? (count / total) * 100 : 0
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500']
                const color = colors[index % colors.length]
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-20 truncate">{type}</span>
                    <div className="flex-1 bg-gray-700 rounded h-4 relative">
                      <div 
                        className={`${color} h-full rounded transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top States */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Top States by Usage</h3>
            <div className="space-y-2">
              {Object.entries(analyticsData.charts.states)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([state, count], index) => {
                  const maxCount = Math.max(...Object.values(analyticsData.charts.states))
                  const width = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={state} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-8">{state}</span>
                      <div className="flex-1 bg-gray-700 rounded h-4 relative">
                        <div 
                          className="bg-indigo-500 h-full rounded transition-all duration-300"
                          style={{ width: `${width}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Analysis Types Split */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Bill Analyzer vs Credit Repair</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{analyticsData.charts.analysisTypes.bill}</div>
              <div className="text-gray-300">Bill Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{analyticsData.charts.analysisTypes.credit}</div>
              <div className="text-gray-300">Credit Repair</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Recent Analyses</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analyticsData.recentActivity.analyses.map((analysis, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium">{analysis.type}</span>
                      <div className="text-xs text-gray-400">{new Date(analysis.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">${analysis.amount}</div>
                      <div className="text-xs text-green-400">${analysis.savingsFound} saved</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Recent Sign-ups</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analyticsData.recentActivity.signups.map((signup, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="text-sm font-medium truncate">{signup.email}</div>
                  <div className="text-xs text-gray-400">{new Date(signup.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Letters */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Recent Letters</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analyticsData.recentActivity.letters.map((letter, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium">{letter.type}</span>
                      <div className="text-xs text-gray-400">{new Date(letter.timestamp).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">{letter.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">User Management</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={exportCSV}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Export CSV
              </button>
            </div>
          </div>

          {selectedUserData ? (
            <div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-blue-400 hover:text-blue-300 mb-4"
              >
                ← Back to user list
              </button>
              <h4 className="text-lg font-semibold mb-4">User: {selectedUserData.email}</h4>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Sign-up Date</div>
                  <div className="font-medium">{selectedUserData.signupDate ? new Date(selectedUserData.signupDate).toLocaleDateString() : 'Unknown'}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Analyses</div>
                  <div className="font-medium">{selectedUserData.analysesCount}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Letters Sent</div>
                  <div className="font-medium">{selectedUserData.lettersSent}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Total Paid</div>
                  <div className="font-medium">${selectedUserData.totalPaid.toFixed(2)}</div>
                </div>
              </div>
              <h5 className="text-lg font-semibold mb-4">Analysis History</h5>
              <div className="space-y-2">
                {selectedUserData.analyses.map((analysis, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded">
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-gray-400 text-xs">Date</div>
                        <div className="text-sm">{new Date(analysis.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Type</div>
                        <div className="text-sm">{analysis.type}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Amount</div>
                        <div className="text-sm">${analysis.amount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">State</div>
                        <div className="text-sm">{analysis.state}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Savings Found</div>
                        <div className="text-sm text-green-400">${analysis.savingsFound}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3">Email</th>
                    <th className="text-left py-3">Sign-up Date</th>
                    <th className="text-left py-3">Analyses</th>
                    <th className="text-left py-3">Letters</th>
                    <th className="text-left py-3">Total Paid</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.signupDate ? new Date(user.signupDate).toLocaleDateString() : 'Unknown'}</td>
                      <td className="py-3">{user.analysesCount}</td>
                      <td className="py-3">{user.lettersSent}</td>
                      <td className="py-3">${user.totalPaid.toFixed(2)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedUser(user.email)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}