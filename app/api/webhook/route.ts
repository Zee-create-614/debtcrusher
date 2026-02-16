import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment, WebhooksHelper } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';
    const squareSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
    
    // Verify webhook signature if signature key is configured
    if (squareSignatureKey) {
      try {
        const isValidWebhook = WebhooksHelper.isValidWebhookEventSignature(
          body,
          signature,
          squareSignatureKey,
          request.url || ''
        );
        
        if (!isValidWebhook) {
          console.error('Square webhook signature verification failed');
          return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
        }
      } catch (err) {
        console.error('Webhook signature verification error:', err);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    
    // Handle the event
    switch (event.type) {
      case 'payment.created':
        const payment = event.data.object;
        console.log('Square payment created:', {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount_money?.amount,
          status: payment.status,
          timestamp: new Date().toISOString(),
        });
        break;

      case 'payment.updated':
        const updatedPayment = event.data.object;
        
        if (updatedPayment.status === 'COMPLETED') {
          console.log('Square payment completed!', {
            paymentId: updatedPayment.id,
            orderId: updatedPayment.order_id,
            amount: updatedPayment.amount_money?.amount,
            timestamp: new Date().toISOString(),
          });

          // Track payment completion
          try {
            const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics/track`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'payment_complete',
                data: {
                  paymentId: updatedPayment.id,
                  orderId: updatedPayment.order_id,
                  amount: updatedPayment.amount_money?.amount ? (Number(updatedPayment.amount_money.amount) / 100).toString() : '0',
                  product: 'square_payment' // We'll need to track this differently with Square
                },
                timestamp: new Date().toISOString()
              })
            });
            
            if (!analyticsResponse.ok) {
              console.error('Failed to track payment analytics');
            }
          } catch (error) {
            console.error('Error tracking payment analytics:', error);
          }

          // TODO: Add fulfillment logic here
          // - Update user's purchased features in database
          // - Send confirmation email
        }
        break;

      default:
        console.log(`Unhandled Square event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}