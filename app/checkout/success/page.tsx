'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(2);

  const logCreditRepairDispute = async (paymentId: string, userEmail: string) => {
    try {
      // Get credit repair results from sessionStorage
      const creditRepairResults = sessionStorage.getItem('creditRepairResults');
      if (!creditRepairResults) {
        console.warn('No credit repair results found for logging');
        return;
      }

      const results = JSON.parse(creditRepairResults);
      if (!results.items || !Array.isArray(results.items)) {
        console.warn('Invalid credit repair results format');
        return;
      }

      // Calculate total letters generated
      let lettersGenerated = 0;
      results.items.forEach((item: any) => {
        // Count bureau dispute letters
        if (item.dispute_letters) {
          ['equifax', 'experian', 'transunion'].forEach(bureau => {
            if (item.dispute_letters[bureau]) lettersGenerated++;
          });
        }
        // Count additional letters
        if (item.goodwill_letter) lettersGenerated++;
        if (item.pay_for_delete_letter) lettersGenerated++;
      });

      // Prepare disputed items for logging
      const disputedItems = results.items.map((item: any) => ({
        account: item.account,
        type: item.type,
        balance: item.balance,
        dispute_reason: item.dispute_reason,
        dispute_type: item.dispute_type,
        confidence: item.confidence,
        estimated_score_impact: item.estimated_score_impact,
      }));

      // Log the dispute
      const response = await fetch('/api/credit-repair/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          disputedItems,
          disputeType: 'bureau_disputes', // Primary dispute type for unlocked letters
          lettersGenerated,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log credit repair dispute:', await response.text());
      } else {
        console.log('Credit repair dispute logged successfully');
      }
    } catch (error) {
      console.error('Error logging credit repair dispute:', error);
    }
  };

  const product = searchParams.get('product');
  const sessionId = searchParams.get('sessionId');
  const userEmail = searchParams.get('userEmail');
  const transactionId = searchParams.get('transactionId') || searchParams.get('checkoutId') || sessionId || 'square-payment';

  useEffect(() => {
    // Store unlock state in sessionStorage
    if (product) {
      sessionStorage.setItem('debtcrusher_unlocked', product);
    }

    // Log credit repair dispute if this was a credit repair purchase
    if (product === 'credit_repair_unlock' && sessionId && userEmail) {
      logCreditRepairDispute(sessionId, userEmail);
    }

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // Redirect based on product type
          const redirectUrl = getRedirectUrl(product);
          router.push(redirectUrl);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [product, router]);

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
            Redirecting you back in {countdown} seconds...
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((2 - countdown) / 2) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            const redirectUrl = getRedirectUrl(product);
            router.push(redirectUrl);
          }}
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