import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SquareClient, SquareEnvironment } from 'square'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = process.env.SQUARE_ACCESS_TOKEN
    const env = process.env.SQUARE_ENVIRONMENT
    const locationId = process.env.SQUARE_LOCATION_ID

    if (!token || !locationId) {
      return NextResponse.json({ payments: [] })
    }

    const client = new SquareClient({
      token: token.trim(),
      environment: env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    })

    // Search for payments at our location
    const response = await client.payments.list({
      locationId,
      sortOrder: 'DESC',
      limit: 50,
    })

    const payments = (response.payments || []).map((p: any) => ({
      id: p.id,
      amount: p.amountMoney ? Number(p.amountMoney.amount) / 100 : 0,
      currency: p.amountMoney?.currency || 'USD',
      status: p.status,
      createdAt: p.createdAt,
      receiptUrl: p.receiptUrl,
      note: p.note || 'DebtCrusher Analysis',
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ payments: [] })
  }
}
