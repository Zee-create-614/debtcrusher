"use client";

import PricingCard from "../components/PricingCard";

export default function PricingPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Simple, <span className="text-crusher-blue">Fair</span> Pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            No subscriptions. No hidden fees. Pay once, get results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          <PricingCard
            name="Bill Analysis"
            price="$9.99"
            description="AI-powered medical bill & debt analysis"
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
            name="Credit Repair"
            price="$25"
            description="AI credit report analysis + personalized dispute letters"
            features={[
              "Full credit report AI analysis",
              "Bureau dispute letters (Equifax, Experian, TransUnion)",
              "Goodwill & pay-for-delete letters",
              "FCRA violation detection",
              "Personalized with your info — ready to mail",
              "60-day money-back guarantee",
            ]}
            cta="Fix My Credit"
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
                  <th className="p-4 text-white text-sm font-semibold text-center">Bill Analysis ($9.99)</th>
                  <th className="p-4 text-crusher-blue text-sm font-semibold text-center">Credit Repair ($25)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["AI-powered analysis", true, true],
                  ["Dispute letter generation", true, true],
                  ["Settlement letters", true, false],
                  ["Negotiation scripts", true, false],
                  ["Statute of limitations check", true, true],
                  ["Credit bureau dispute letters (3 bureaus)", false, true],
                  ["Goodwill letters", false, true],
                  ["Pay-for-delete letters", false, true],
                  ["FCRA violation detection", false, true],
                  ["Personalized with your info", false, true],
                  ["Money-back guarantee", true, true],
                ].map(([feature, bill, credit], i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="p-4 text-slate-300">{feature as string}</td>
                    <td className="p-4 text-center">
                      {typeof bill === "boolean" ? (bill ? <span className="text-crusher-green">✓</span> : <span className="text-slate-600">—</span>) : <span className="text-white">{bill as string}</span>}
                    </td>
                    <td className="p-4 text-center">
                      {typeof credit === "boolean" ? (credit ? <span className="text-crusher-green">✓</span> : <span className="text-slate-600">—</span>) : <span className="text-white font-semibold">{credit as string}</span>}
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
              { q: "How does the money-back guarantee work?", a: "If our analysis doesn't find any errors, overcharges, or actionable items, we refund you in full. No questions asked, no fine print." },
              { q: "Is this a subscription?", a: "No. You pay once per analysis. No recurring charges, no subscriptions, no surprises." },
              { q: "What do I get with Credit Repair?", a: "Upload your credit report and our AI analyzes every negative item, then generates personalized dispute letters for all 3 bureaus (Equifax, Experian, TransUnion) plus goodwill and pay-for-delete letters — ready to print and mail." },
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
