import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { redis } from '../../../lib/redis'

interface SavedResults {
  email: string
  results: any
  savedAt: string
  unlocked: boolean
  unlockedAt?: string
}

function redisKey(email: string) {
  return `user:credit-results:${email}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { results } = body

    if (!results || !results.items) {
      return NextResponse.json({ error: 'Invalid results data' }, { status: 400 })
    }

    const saveData: SavedResults = {
      email: session.user.email,
      results,
      savedAt: new Date().toISOString(),
      unlocked: false,
    }

    await redis.set(redisKey(session.user.email), saveData)

    return NextResponse.json({ success: true, message: 'Results saved successfully' })
  } catch (error) {
    console.error('Error saving credit repair results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savedData = await redis.get<SavedResults>(redisKey(session.user.email))
    
    if (!savedData) {
      return NextResponse.json({ error: 'No saved results found' }, { status: 404 })
    }

    return NextResponse.json({ 
      results: savedData.results,
      unlocked: savedData.unlocked || false,
      savedAt: savedData.savedAt 
    })
  } catch (error) {
    console.error('Error retrieving credit repair results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { unlocked } = body

    const key = redisKey(session.user.email)
    const savedData = await redis.get<SavedResults>(key)
    
    if (!savedData) {
      return NextResponse.json({ error: 'No saved results found' }, { status: 404 })
    }

    savedData.unlocked = unlocked
    savedData.unlockedAt = new Date().toISOString()
    await redis.set(key, savedData)

    return NextResponse.json({ success: true, message: 'Results unlock status updated' })
  } catch (error) {
    console.error('Error updating credit repair results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
