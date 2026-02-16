import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const env = process.env.SQUARE_ENVIRONMENT;

    console.log('Square config check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 6),
      locationId,
      env,
    });

    if (!token) {
      return NextResponse.json({ error: 'Square token not configured' }, { status: 500 });
    }
    if (!locationId) {
      return NextResponse.json({ error: 'Square location not configured' }, { status: 500 });
    }

    const client = new SquareClient({
      token: token.trim(),
      environment: env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const body = await request.json();
    const { product, amount, description, successUrl, cancelUrl } = body;

    if (!product || !amount || !description || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkoutSessionId = randomUUID();
    const amountNumber = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);

    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(amountNumber),
          currency: 'USD',
        },
        locationId: locationId,
      },
      checkoutOptions: {
        redirectUrl: `${successUrl}?product=${product}&sessionId=${checkoutSessionId}`,
      },
    });

    if (response.paymentLink?.url) {
      return NextResponse.json({ url: response.paymentLink.url });
    } else {
      throw new Error('No payment link URL returned');
    }
  } catch (error) {
    console.error('Square checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
