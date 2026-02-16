import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySquareSignature(body: string, signature: string, sigKey: string, url: string): boolean {
  const hmac = crypto.createHmac('sha256', sigKey);
  hmac.update(url + body);
  return hmac.digest('base64') === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';
    const squareSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
    
    if (squareSignatureKey) {
      if (!verifySquareSignature(body, signature, squareSignatureKey, request.url || '')) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    
    switch (event.type) {
      case 'payment.completed':
      case 'payment.updated':
        const payment = event.data?.object?.payment || event.data?.object;
        if (payment?.status === 'COMPLETED') {
          console.log('Square payment completed:', {
            paymentId: payment.id,
            amount: payment.amount_money?.amount,
            timestamp: new Date().toISOString(),
          });

          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://debtcrusher.ai'}/api/analytics/track`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'payment_complete',
                data: {
                  paymentId: payment.id,
                  amount: payment.amount_money?.amount ? (Number(payment.amount_money.amount) / 100).toString() : '0',
                  product: 'square_payment'
                },
                timestamp: new Date().toISOString()
              })
            });
          } catch (error) {
            console.error('Analytics tracking error:', error);
          }
        }
        break;

      default:
        console.log(`Unhandled Square event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Square webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
