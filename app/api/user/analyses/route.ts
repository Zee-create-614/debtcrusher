import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { redis } from '../../../lib/redis'

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

function redisKey(email: string) {
  return `user:analyses:${email}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analyses = await redis.get<Analysis[]>(redisKey(session.user.email))

    return NextResponse.json({ analyses: analyses || [] })
  } catch (error) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, summary, savingsFound, itemsDisputed, results } = body

    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      type,
      date: new Date().toISOString(),
      summary,
      savingsFound,
      itemsDisputed,
      results,
      refundEligible: true,
      refundDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      lettersSent: [],
      letterStatus: 'pending'
    }

    const key = redisKey(session.user.email)
    const existing = await redis.get<Analysis[]>(key) || []
    existing.push(newAnalysis)
    await redis.set(key, existing)

    return NextResponse.json({ success: true, analysis: newAnalysis })
  } catch (error) {
    console.error('Error saving analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
