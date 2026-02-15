import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'

const ANALYTICS_FILE = process.env.ANALYTICS_FILE || '/tmp/debtcrusher-analytics.json'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'crusher2026'

interface AnalyticsEvent {
  id: string
  event: string
  data: any
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    // Check admin password
    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read analytics data
    let analyticsData: AnalyticsEvent[] = []
    if (existsSync(ANALYTICS_FILE)) {
      try {
        const fileContent = await fs.readFile(ANALYTICS_FILE, 'utf-8')
        analyticsData = JSON.parse(fileContent)
      } catch (error) {
        console.error('Error reading analytics file:', error)
      }
    }

    // Process and aggregate the data
    const processed = processAnalyticsData(analyticsData)

    return NextResponse.json({
      success: true,
      data: processed,
      rawEvents: analyticsData
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function processAnalyticsData(events: AnalyticsEvent[]) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

  // Overview metrics
  const totalAnalyses = events.filter(e => e.event === 'analysis_complete').length
  const totalUsers = new Set(events.filter(e => e.event === 'user_signup').map(e => e.data?.email || e.data?.userId)).size
  const totalLetters = events.filter(e => e.event === 'letter_sent').length
  const totalRevenue = events.filter(e => e.event === 'payment_complete')
    .reduce((sum, e) => sum + (parseFloat(e.data?.amount) || 0), 0)
  
  const analysisUnlocks = events.filter(e => e.event === 'analysis_complete' && e.data?.unlocked === true).length
  const conversionRate = totalAnalyses > 0 ? (analysisUnlocks / totalAnalyses * 100) : 0

  // Charts data - last 30 days
  const dailyAnalyses = getDailyData(events.filter(e => e.event === 'analysis_complete'), thirtyDaysAgo, now)
  const dailyRevenue = getDailyRevenue(events.filter(e => e.event === 'payment_complete'), thirtyDaysAgo, now)
  
  // Debt types
  const debtTypes = events.filter(e => e.event === 'analysis_complete' && e.data?.debtType)
    .reduce((acc: any, e) => {
      const type = e.data.debtType
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

  // States
  const states = events.filter(e => e.event === 'analysis_complete' && e.data?.state)
    .reduce((acc: any, e) => {
      const state = e.data.state
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {})

  // Analysis types
  const billAnalyses = events.filter(e => e.event === 'analysis_complete' && e.data?.type === 'bill').length
  const creditRepairAnalyses = events.filter(e => e.event === 'analysis_complete' && e.data?.type === 'credit').length

  // Recent activities
  const recentAnalyses = events.filter(e => e.event === 'analysis_complete')
    .slice(-20)
    .reverse()
    .map(e => ({
      timestamp: e.timestamp,
      type: e.data?.type || 'unknown',
      amount: e.data?.amount || 0,
      state: e.data?.state || 'unknown',
      savingsFound: e.data?.savingsFound || 0
    }))

  const recentSignups = events.filter(e => e.event === 'user_signup')
    .slice(-20)
    .reverse()
    .map(e => ({
      email: e.data?.email || 'unknown',
      timestamp: e.timestamp
    }))

  const recentLetters = events.filter(e => e.event === 'letter_sent')
    .slice(-20)
    .reverse()
    .map(e => ({
      type: e.data?.type || 'unknown',
      status: e.data?.status || 'sent',
      timestamp: e.timestamp
    }))

  // User list with aggregated data
  const userEmails = Array.from(new Set(events.filter(e => e.event === 'user_signup').map(e => e.data?.email)))
  const users = userEmails.map(email => {
    const signupEvent = events.find(e => e.event === 'user_signup' && e.data?.email === email)
    const userAnalyses = events.filter(e => e.event === 'analysis_complete' && e.data?.email === email)
    const userLetters = events.filter(e => e.event === 'letter_sent' && e.data?.email === email)
    const userPayments = events.filter(e => e.event === 'payment_complete' && e.data?.email === email)
    const totalPaid = userPayments.reduce((sum, e) => sum + (parseFloat(e.data?.amount) || 0), 0)

    return {
      email,
      signupDate: signupEvent?.timestamp || null,
      analysesCount: userAnalyses.length,
      lettersSent: userLetters.length,
      totalPaid,
      analyses: userAnalyses.map(a => ({
        timestamp: a.timestamp,
        type: a.data?.type || 'unknown',
        amount: a.data?.amount || 0,
        state: a.data?.state || 'unknown',
        savingsFound: a.data?.savingsFound || 0
      }))
    }
  })

  return {
    overview: {
      totalAnalyses,
      totalUsers,
      totalLetters,
      totalRevenue,
      conversionRate
    },
    charts: {
      dailyAnalyses,
      dailyRevenue,
      debtTypes,
      states,
      analysisTypes: { bill: billAnalyses, credit: creditRepairAnalyses }
    },
    recentActivity: {
      analyses: recentAnalyses,
      signups: recentSignups,
      letters: recentLetters
    },
    users
  }
}

function getDailyData(events: AnalyticsEvent[], startDate: Date, endDate: Date) {
  const dailyData: { [key: string]: number } = {}
  
  // Initialize all days with 0
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = 0
  }
  
  // Count events by day
  events.forEach(event => {
    const eventDate = new Date(event.timestamp)
    if (eventDate >= startDate && eventDate <= endDate) {
      const dateStr = eventDate.toISOString().split('T')[0]
      dailyData[dateStr] = (dailyData[dateStr] || 0) + 1
    }
  })
  
  return Object.entries(dailyData).map(([date, count]) => ({ date, count }))
}

function getDailyRevenue(events: AnalyticsEvent[], startDate: Date, endDate: Date) {
  const dailyData: { [key: string]: number } = {}
  
  // Initialize all days with 0
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = 0
  }
  
  // Sum revenue by day
  events.forEach(event => {
    const eventDate = new Date(event.timestamp)
    if (eventDate >= startDate && eventDate <= endDate) {
      const dateStr = eventDate.toISOString().split('T')[0]
      const amount = parseFloat(event.data?.amount) || 0
      dailyData[dateStr] = (dailyData[dateStr] || 0) + amount
    }
  })
  
  return Object.entries(dailyData).map(([date, revenue]) => ({ date, revenue }))
}