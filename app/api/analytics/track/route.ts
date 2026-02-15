import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { existsSync } from 'fs'

const ANALYTICS_FILE = process.env.ANALYTICS_FILE || '/tmp/debtcrusher-analytics.json'

interface AnalyticsEvent {
  event: string
  data: object
  timestamp: string
  id?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, timestamp } = body

    if (!event) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 })
    }

    const analyticsEvent: AnalyticsEvent = {
      id: generateId(),
      event,
      data: data || {},
      timestamp: timestamp || new Date().toISOString()
    }

    // Ensure directory exists
    const dir = path.dirname(ANALYTICS_FILE)
    await fs.mkdir(dir, { recursive: true })

    // Read existing data or create empty array
    let existingData: AnalyticsEvent[] = []
    if (existsSync(ANALYTICS_FILE)) {
      try {
        const fileContent = await fs.readFile(ANALYTICS_FILE, 'utf-8')
        existingData = JSON.parse(fileContent)
      } catch (error) {
        console.error('Error reading analytics file:', error)
      }
    }

    // Add new event
    existingData.push(analyticsEvent)

    // Keep only last 10,000 events to prevent file from growing too large
    if (existingData.length > 10000) {
      existingData = existingData.slice(-10000)
    }

    // Write back to file
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(existingData, null, 2))

    return NextResponse.json({ success: true, id: analyticsEvent.id })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}