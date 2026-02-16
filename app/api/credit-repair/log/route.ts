import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { creditRepairDb, DisputedItem } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      paymentId, 
      disputedItems, 
      disputeType = 'bureau_disputes',
      lettersGenerated 
    } = body;

    // Validate required fields
    if (!disputedItems || !Array.isArray(disputedItems) || disputedItems.length === 0) {
      return NextResponse.json(
        { error: 'Disputed items are required' },
        { status: 400 }
      );
    }

    if (typeof lettersGenerated !== 'number') {
      return NextResponse.json(
        { error: 'Letters generated count is required' },
        { status: 400 }
      );
    }

    // Validate dispute type
    const validDisputeTypes = ['bureau_disputes', 'goodwill', 'pay_for_delete'];
    if (!validDisputeTypes.includes(disputeType)) {
      return NextResponse.json(
        { error: 'Invalid dispute type' },
        { status: 400 }
      );
    }

    // Sanitize and validate disputed items
    const sanitizedItems: DisputedItem[] = disputedItems.map((item: any) => ({
      account: String(item.account || ''),
      type: String(item.type || ''),
      balance: Number(item.balance || 0),
      dispute_reason: String(item.dispute_reason || ''),
      dispute_type: String(item.dispute_type || ''),
      confidence: String(item.confidence || ''),
      estimated_score_impact: Number(item.estimated_score_impact || 0),
    }));

    // Log the credit repair dispute
    await creditRepairDb.logCreditRepairDispute(
      session.user.email,
      paymentId || null,
      sanitizedItems,
      disputeType,
      lettersGenerated
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Credit repair dispute logged successfully' 
    });

  } catch (error) {
    console.error('Error logging credit repair dispute:', error);
    return NextResponse.json(
      { error: 'Failed to log credit repair dispute' },
      { status: 500 }
    );
  }
}