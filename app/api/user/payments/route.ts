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

    const allPayments: any[] = []
    
    for await (const payment of await client.payments.list({
      locationId,
      sortOrder: 'DESC',
    })) {
      allPayments.push({
        id: (payment as any).id,
        amount: (payment as any).amountMoney ? Number((payment as any).amountMoney.amount) / 100 : 0,
        currency: (payment as any).amountMoney?.currency || 'USD',
        status: (payment as any).status,
        createdAt: (payment as any).createdAt,
        receiptUrl: (payment as any).receiptUrl,
        note: (payment as any).note || 'DebtCrusher Analysis',
      })
      if (allPayments.length >= 50) break
    }

    return NextResponse.json({ payments: allPayments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ payments: [] })
  }
}
