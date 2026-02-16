import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check env vars exist (don't leak values)
    const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL
    const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN
    const redisUrlPrefix = process.env.UPSTASH_REDIS_REST_URL?.substring(0, 20) || 'NOT SET'
    
    let redisStatus = 'not tested'
    let redisError = null
    let testData = null

    if (hasRedisUrl && hasRedisToken) {
      try {
        const { Redis } = await import('@upstash/redis')
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })
        
        // Test write
        await redis.set('debug:test', { time: new Date().toISOString(), status: 'ok' })
        // Test read
        testData = await redis.get('debug:test')
        redisStatus = 'connected'
        
        // Check what keys exist for the user
        if (session?.user?.email) {
          const email = session.user.email
          const analyses = await redis.get(`user:analyses:${email}`)
          const creditResults = await redis.get<any>(`user:credit-results:${email}`)
          const payments = await redis.get(`user:payments:${email}`)
          
          return NextResponse.json({
            redis: { status: redisStatus, urlPrefix: redisUrlPrefix, testData },
            session: { email: session.user.email },
            userData: {
              analyses: analyses ? 'EXISTS' : 'EMPTY',
              analysesCount: Array.isArray(analyses) ? (analyses as any[]).length : 0,
              creditResults: creditResults ? 'EXISTS' : 'EMPTY',
              creditResultsHasUserInfo: creditResults?.results?.user_info ? 'YES' : 'NO',
              creditResultsUserInfo: creditResults?.results?.user_info || null,
              creditResultsUnlocked: creditResults?.unlocked || false,
              payments: payments ? 'EXISTS' : 'EMPTY',
              paymentsCount: Array.isArray(payments) ? (payments as any[]).length : 0,
            }
          })
        }
      } catch (e: any) {
        redisStatus = 'error'
        redisError = e.message
      }
    }

    return NextResponse.json({
      redis: { 
        hasUrl: hasRedisUrl, 
        hasToken: hasRedisToken, 
        urlPrefix: redisUrlPrefix,
        status: redisStatus, 
        error: redisError,
        testData 
      },
      session: session?.user?.email ? { email: session.user.email } : 'not logged in',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
