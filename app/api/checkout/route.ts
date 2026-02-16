import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, amount, description, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!product || !amount || !description || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Square Payment Link
    const checkoutApi = client.checkoutApi;
    
    const createPaymentLinkRequest = {
      idempotencyKey: randomUUID(),
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(amount), // Square expects amount in cents as BigInt
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      checkoutOptions: {
        redirectUrl: `${successUrl}?product=${product}`,
        // Note: Square doesn't have a direct cancel URL - users can close the checkout
      },
    };

    const response = await checkoutApi.createPaymentLink(createPaymentLinkRequest);
    
    if (response.result.paymentLink?.url) {
      return NextResponse.json({ url: response.result.paymentLink.url });
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