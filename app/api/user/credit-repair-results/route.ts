import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Use /tmp on Vercel (serverless), or local data dir in dev
const dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data', 'user_results');

interface CreditRepairResults {
  items: any[];
  summary: string;
  total_disputable: number;
  estimated_total_score_improvement: number;
  tips: string[];
}

function getEmailHash(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex');
}

function getUserResultsPath(email: string): string {
  const emailHash = getEmailHash(email);
  return path.join(dataDir, `${emailHash}.json`);
}

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { results } = body;

    if (!results || !results.items) {
      return NextResponse.json({ error: 'Invalid results data' }, { status: 400 });
    }

    ensureDataDir();
    
    const resultsPath = getUserResultsPath(session.user.email);
    const saveData = {
      email: session.user.email,
      results: results,
      savedAt: new Date().toISOString(),
      unlocked: false // Will be updated when payment is successful
    };

    fs.writeFileSync(resultsPath, JSON.stringify(saveData, null, 2));

    return NextResponse.json({ success: true, message: 'Results saved successfully' });
  } catch (error) {
    console.error('Error saving credit repair results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resultsPath = getUserResultsPath(session.user.email);
    
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json({ error: 'No saved results found' }, { status: 404 });
    }

    const savedData = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    return NextResponse.json({ 
      results: savedData.results,
      unlocked: savedData.unlocked || false,
      savedAt: savedData.savedAt 
    });
  } catch (error) {
    console.error('Error retrieving credit repair results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { unlocked } = body;

    const resultsPath = getUserResultsPath(session.user.email);
    
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json({ error: 'No saved results found' }, { status: 404 });
    }

    const savedData = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    savedData.unlocked = unlocked;
    savedData.unlockedAt = new Date().toISOString();

    fs.writeFileSync(resultsPath, JSON.stringify(savedData, null, 2));

    return NextResponse.json({ success: true, message: 'Results unlock status updated' });
  } catch (error) {
    console.error('Error updating credit repair results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}