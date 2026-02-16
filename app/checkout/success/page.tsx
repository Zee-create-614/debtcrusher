'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [countdown, setCountdown] = useState(3);
  const [saved, setSaved] = useState(false);

  const product = searchParams.get('product');
  const sessionId = searchParams.get('sessionId');
  const transactionId = searchParams.get('transactionId') || searchParams.get('checkoutId') || sessionId || 'square-payment';

  useEffect(() => {
    if (!session?.user?.email) return;
    if (saved) return;

    const savePaymentAndUnlock = async () => {
      try {
        // 1. Record payment in Redis
        await fetch('/api/user/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: transactionId,
            amount: product === 'credit_repair_unlock' ? 0.10 : 9.99,
            currency: 'USD',
            status: 'COMPLETED',
            note: getProductName(product),
            product: product,
          }),
        });

        // 2. If credit repair, unlock the letters in Redis
        if (product === 'credit_repair_unlock' || product === 'letters_unlock') {
          await fetch('/api/user/credit-repair-results', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unlocked: true }),
          });
        }

        // 3. Also set sessionStorage as backup
        if (product) {
          sessionStorage.setItem('debtcrusher_unlocked', product);
        }

        // Fire Google Ads conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            send_to: 'AW-17957953316/purchase',
            value: product === 'credit_repair_unlock' ? 25.0 : 9.99,
            currency: 'USD',
            transaction_id: transactionId,
          });
        }

        setSaved(true);
      } catch (error) {
        console.error('Error saving payment:', error);
        setSaved(true); // Don't block redirect
      }
    };

    savePaymentAndUnlock();
  }, [session, saved]);

  useEffect(() => {
    if (!saved) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(getRedirectUrl(product));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [saved, product, router]);

  const getRedirectUrl = (productType: string | null) => {
    switch (productType) {
      case 'script_unlock':
        return '/results?unlocked=script';
      case 'credit_repair_unlock':
      case 'letters_unlock':
        return '/credit-repair/results?unlocked=letters';
      case 'send_letter':
      case 'send_all_letters':
        return '/credit-repair/results?unlocked=send';
      default:
        return '/';
    }
  };

  const getProductName = (productType: string | null) => {
    switch (productType) {
      case 'script_unlock':
        return 'Full Script';
      case 'credit_repair_unlock':
      case 'letters_unlock':
        return 'All Dispute Letters';
      case 'send_letter':
        return 'Letter Sending';
      case 'send_all_letters':
        return 'All Letters Sending';
      default:
        return 'Purchase';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful! ✅
          </h1>
          {product && (
            <p className="text-gray-600">
              You've unlocked: <strong>{getProductName(product)}</strong>
            </p>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {transactionId && transactionId !== 'square-payment' && (
            <p>Transaction ID: {transactionId.substring(0, 20)}...</p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">
            {saved ? `Redirecting in ${countdown} seconds...` : 'Saving your purchase...'}
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: saved ? `${((3 - countdown) / 3) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <button
          onClick={() => router.push(getRedirectUrl(product))}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Continue now
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
