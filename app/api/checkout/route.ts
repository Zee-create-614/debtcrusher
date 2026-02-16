import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, amount, description, successUrl, cancelUrl } = body;

    console.log('Checkout request received:', { product, amount, description, successUrl, cancelUrl });

    if (!product || !amount || !description || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('SQUARE_ACCESS_TOKEN is not set');
      return NextResponse.json(
        { error: 'Square configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error('SQUARE_LOCATION_ID is not set');
      return NextResponse.json(
        { error: 'Square configuration error' },
        { status: 500 }
      );
    }

    const checkoutSessionId = randomUUID();

    // Convert amount to number for Square SDK v44 - no BigInt needed
    const amountNumber = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);
    
    console.log('Creating Square payment link with amount:', amountNumber);

    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(amountNumber),
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      checkoutOptions: {
        redirectUrl: `${successUrl}?product=${product}&sessionId=${checkoutSessionId}`,
      },
    });

    console.log('Square response received:', {
      hasPaymentLink: !!response.paymentLink,
      hasUrl: !!response.paymentLink?.url,
      errors: response.errors
    });

    if (response.errors && response.errors.length > 0) {
      console.error('Square API errors:', response.errors);
      return NextResponse.json(
        { 
          error: 'Square API error', 
          details: response.errors.map(e => e.detail).join(', ')
        },
        { status: 500 }
      );
    }

    if (response.paymentLink?.url) {
      return NextResponse.json({ url: response.paymentLink.url });
    } else {
      throw new Error('No payment link URL returned from Square');
    }
  } catch (error) {
    console.error('Error creating Square checkout:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
