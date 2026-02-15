import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'

const DATA_FILE = '/tmp/debtcrusher-users.json'

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

interface UserData {
  email: string
  analyses: Analysis[]
}

interface UsersDatabase {
  [email: string]: UserData
}

function readUserData(): UsersDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading user data:', error)
  }
  return {}
}

function writeUserData(data: UsersDatabase) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing user data:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = readUserData()
    const userAnalyses = userData[session.user.email]?.analyses || []

    return NextResponse.json({ analyses: userAnalyses })
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
      refundDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      lettersSent: [],
      letterStatus: 'pending'
    }

    const userData = readUserData()
    
    if (!userData[session.user.email]) {
      userData[session.user.email] = {
        email: session.user.email,
        analyses: []
      }
    }

    userData[session.user.email].analyses.push(newAnalysis)
    writeUserData(userData)

    return NextResponse.json({ success: true, analysis: newAnalysis })
  } catch (error) {
    console.error('Error saving analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}