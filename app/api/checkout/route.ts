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

    if (!product || !amount || !description || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const checkoutSessionId = randomUUID();

    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(amount),
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      checkoutOptions: {
        redirectUrl: `${successUrl}?product=${product}&sessionId=${checkoutSessionId}`,
      },
    });

    if (response.paymentLink?.url) {
      return NextResponse.json({ url: response.paymentLink.url });
    } else {
      throw new Error('No payment link URL returned from Square');
    }
  } catch (error) {
    console.error('Error creating Square checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
