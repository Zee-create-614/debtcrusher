"use client";

import { useState } from "react";
import PricingCard from "../components/PricingCard";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Simple, <span className="text-crusher-blue">Fair</span> Pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            No hidden fees. No tricks. If we don&apos;t find savings, you don&apos;t pay.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${!annual ? 'bg-crusher-blue text-white' : 'text-slate-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${annual ? 'bg-crusher-blue text-white' : 'text-slate-400'}`}
            >
              Annual <span className="text-crusher-green text-xs">Save 32%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          <PricingCard
            name="Single Analysis"
            price="$25"
            description="One-time analysis of any bill or collection notice"
            features={[
              "Complete bill error & overcharge analysis",
              "Dispute letter generation",
              "Settlement recommendation & letter",
              "Negotiation script with talking points",
              "Statute of limitations check",
              "100% money-back guarantee",
            ]}
            cta="Analyze My Bill"
          />
          <PricingCard
            name="Unlimited Crusher"
            price={annual ? "$33" : "$49"}
            period={annual ? "/mo (billed annually at $399)" : "/month"}
            description="Unlimited analyses + complete collections defense"
            features={[
              "Everything in Single Analysis",
              "Unlimited bill analyses",
              "Collections defense toolkit",
              "FDCPA violation detection & reports",
              "Credit bureau dispute letters (all 3)",
              "Priority AI processing",
              "Email support",
            ]}
            cta="Start Crushing"
            highlighted
            badge="MOST POPULAR"
          />
        </div>

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-2xl font-black text-white text-center mb-8">Feature Comparison</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Feature</th>
                  <th className="p-4 text-white text-sm font-semibold text-center">Single ($25)</th>
                  <th className="p-4 text-crusher-blue text-sm font-semibold text-center">Unlimited ({annual ? "$33" : "$49"}/mo)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Bill error analysis", true, true],
                  ["Dispute letter generation", true, true],
                  ["Settlement letters", true, true],
                  ["Negotiation scripts", true, true],
                  ["Statute of limitations check", true, true],
                  ["Number of analyses", "1", "Unlimited"],
                  ["FDCPA violation reports", false, true],
                  ["Credit bureau dispute letters", false, true],
                  ["Priority processing", false, true],
                  ["Money-back guarantee", true, true],
                ].map(([feature, single, unlimited], i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="p-4 text-slate-300">{feature as string}</td>
                    <td className="p-4 text-center">
                      {typeof single === "boolean" ? (single ? <span className="text-crusher-green">✓</span> : <span className="text-slate-600">—</span>) : <span className="text-white">{single as string}</span>}
                    </td>
                    <td className="p-4 text-center">
                      {typeof unlimited === "boolean" ? (unlimited ? <span className="text-crusher-green">✓</span> : <span className="text-slate-600">—</span>) : <span className="text-white font-semibold">{unlimited as string}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "How does the money-back guarantee work?", a: "If our analysis doesn't find any errors, overcharges, or actionable savings opportunities in your bill, we refund your $25 in full. No questions asked, no fine print." },
              { q: "Can I cancel the unlimited plan anytime?", a: "Yes. Cancel anytime from your account dashboard. You'll keep access through the end of your billing period. No cancellation fees." },
              { q: "What counts as an 'analysis'?", a: "Each bill, collection notice, or debt description you submit counts as one analysis. The unlimited plan lets you submit as many as you need." },
              { q: "Do you store my payment information?", a: "We use Square for payment processing. We never see or store your full card number. All transactions are encrypted and secure." },
            ].map((faq, i) => (
              <details key={i} className="glass rounded-xl group">
                <summary className="p-5 cursor-pointer font-semibold text-white hover:text-crusher-blue transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-5 pb-5 text-slate-400 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
