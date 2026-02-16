import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { redis } from '../../../lib/redis'

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  receiptUrl?: string
  note: string
  product?: string
}

function redisKey(email: string) {
  return `user:payments:${email}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await redis.get<PaymentRecord[]>(redisKey(session.user.email))

    return NextResponse.json({ payments: payments || [] })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ payments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, amount, currency, status, receiptUrl, note, product } = body

    const payment: PaymentRecord = {
      id: id || Date.now().toString(),
      amount: amount || 0,
      currency: currency || 'USD',
      status: status || 'COMPLETED',
      createdAt: new Date().toISOString(),
      receiptUrl,
      note: note || 'DebtCrusher Analysis',
      product,
    }

    const key = redisKey(session.user.email)
    const existing = await redis.get<PaymentRecord[]>(key) || []
    existing.push(payment)
    await redis.set(key, existing)

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Error saving payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
