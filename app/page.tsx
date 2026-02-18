import StatCard from "./components/StatCard";
import PricingCard from "./components/PricingCard";
import MoneyBackBadge from "./components/MoneyBackBadge";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-crusher-blue/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-block bg-crusher-blue/10 border border-crusher-blue/20 rounded-full px-4 py-1.5 text-sm text-crusher-blue font-medium mb-6">
              AI-Powered Debt Defense
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              Crush Your Debt.
              <br />
              <span className="text-crusher-blue">Fix Your Credit.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              AI-powered bill analysis, collections defense, and credit repair — all in one place. Upload a bill or credit report and our AI does the rest.
            </p>
            <div className="flex flex-col items-center gap-4 mb-8">
              <a href="/analyze" className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-12 py-5 rounded-xl font-black text-xl transition-all hover:scale-105 animate-pulse-glow shadow-2xl shadow-crusher-blue/25">
                📤 Upload Your Bill Now — Free to Try
              </a>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/analyze" className="text-crusher-blue hover:text-white border border-crusher-blue hover:bg-crusher-blue px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                  Analyze Medical Bill
                </a>
                <a href="/credit-repair" className="text-crusher-green hover:text-white border border-crusher-green hover:bg-crusher-green px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                  Fix My Credit
                </a>
              </div>
            </div>
            <MoneyBackBadge />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard value="$200B+" label="Americans overpay annually on medical bills" icon="💸" />
            <StatCard value="80%" label="of medical bills contain errors or overcharges" icon="⚠️" />
            <StatCard value="79%" label="of credit reports contain at least one error" icon="📊" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to take back control of your medical bills and collections.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "📤", title: "Upload or Describe", desc: "Upload your bill, paste collector communications, or describe your debt. We accept photos, PDFs, emails, and text." },
              { step: "2", icon: "🤖", title: "AI Analyzes Everything", desc: "Our AI cross-references thousands of billing codes, fair market prices, and legal protections to find every error and opportunity." },
              { step: "3", icon: "⚔️", title: "Get Your Arsenal", desc: "Receive dispute letters, negotiation scripts, settlement offers, and a complete defense strategy — ready to send." },
            ].map((item) => (
              <div key={item.step} className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-crusher-blue/20 text-crusher-blue font-black text-lg mb-4">
                  {item.step}
                </div>
                <span className="text-4xl block mb-4">{item.icon}</span>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">
            Your Weapons Against Unfair Debt
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Medical Bill Analyzer */}
            <div className="glass rounded-2xl p-8 hover:scale-[1.02] transition-all">
              <span className="text-5xl block mb-4">🏥</span>
              <h3 className="text-2xl font-black text-white mb-3">Medical Bill Analyzer</h3>
              <p className="text-slate-400 mb-6">Upload any medical bill and our AI instantly identifies overcharges, duplicate charges, and billing errors.</p>
              <ul className="space-y-3 mb-6">
                {["CPT code verification against fair market rates", "Duplicate charge detection", "Upcoding identification", "Auto-generated dispute letters", "Itemized bill request templates"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-crusher-blue">⚡</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/analyze" className="inline-block bg-crusher-blue hover:bg-crusher-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                Analyze a Bill →
              </a>
            </div>

            {/* Credit Repair */}
            <div className="glass rounded-2xl p-8 hover:scale-[1.02] transition-all border border-crusher-green/20 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-crusher-green/20 text-crusher-green text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <span className="text-5xl block mb-4">📈</span>
              <h3 className="text-2xl font-black text-white mb-3">Credit Repair</h3>
              <p className="text-slate-400 mb-6">Upload your credit report and our AI finds every disputable item and generates dispute letters for all 3 bureaus.</p>
              <ul className="space-y-3 mb-6">
                {["AI reads your entire credit report", "Identifies every disputable item", "FCRA-compliant dispute letters × 3 bureaus", "Goodwill & pay-for-delete letters", "One-click send via certified mail"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-crusher-green">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/credit-repair" className="inline-block bg-crusher-green hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                Analyze My Credit →
              </a>
            </div>

            {/* Collections Crusher */}
            <div className="glass rounded-2xl p-8 hover:scale-[1.02] transition-all">
              <span className="text-5xl block mb-4">🛡️</span>
              <h3 className="text-2xl font-black text-white mb-3">Collections Crusher</h3>
              <p className="text-slate-400 mb-6">Being contacted by collectors? We arm you with legal defenses, settlement strategies, and violation reports.</p>
              <ul className="space-y-3 mb-6">
                {["Debt validation letter generation", "Settlement offer calculations (pay 30-50¢ on the dollar)", "FDCPA violation detection", "Statute of limitations checker by state", "Negotiation scripts + phone guides"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400">🛡️</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/analyze" className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                Crush Collections →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <span className="text-3xl block mb-2">🔒</span>
              <p className="text-white font-semibold">256-bit Encryption</p>
              <p className="text-slate-400 text-sm">Bank-level security for your data</p>
            </div>
            <div>
              <span className="text-3xl block mb-2">🗑️</span>
              <p className="text-white font-semibold">Auto-Delete After Analysis</p>
              <p className="text-slate-400 text-sm">Your bills are never stored permanently</p>
            </div>
            <div>
              <span className="text-3xl block mb-2">⚖️</span>
              <p className="text-white font-semibold">HIPAA-Compliant Processing</p>
              <p className="text-slate-400 text-sm">Your medical data stays protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">Simple, Fair Pricing</h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">No hidden fees. No subscriptions required. Pay only if we find savings.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">People Are Fighting Back</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", location: "Austin, TX", quote: "DebtCrusher found $3,200 in overcharges on my ER bill. The dispute letter worked — hospital reduced my bill by 60%.", savings: "$3,200" },
              { name: "James R.", location: "Columbus, OH", quote: "A collector was harassing me for a debt past the statute of limitations. DebtCrusher caught it and generated a cease letter. Debt gone.", savings: "$8,400" },
              { name: "Maria L.", location: "Miami, FL", quote: "I was about to pay $4,800 for a surgery bill. The AI found duplicate charges and upcoding. Settled for $1,900.", savings: "$2,900" },
            ].map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-crusher-gold">★</span>)}
                </div>
                <p className="text-slate-300 text-sm mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.location}</p>
                  </div>
                  <span className="text-crusher-green font-black">Saved {t.savings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is my medical data safe?", a: "Absolutely. We use 256-bit encryption, HIPAA-compliant processing, and auto-delete your data after analysis. We never store your bills permanently or share your information with third parties." },
              { q: "How accurate is the AI analysis?", a: "Our AI cross-references your bill against a database of thousands of CPT codes, fair market rates, and common billing errors. We catch overcharges that most people would never notice. If we don't find savings, you get a full refund." },
              { q: "What types of bills can you analyze?", a: "Medical bills, hospital bills, ER bills, dental bills, lab bills, and collection notices. We support PDF uploads, photos/screenshots, pasted text, or manual description of your charges." },
              { q: "How does the money-back guarantee work?", a: "We guarantee at least 1 item removed from your credit report within 60 days. If not a single disputed item is removed, you get a full $9.99 refund. Simply come back to our Verify Results page, upload your updated credit report, and if zero items were removed, claim your refund instantly." },
              { q: "Is this legal advice?", a: "No. DebtCrusher provides educational information and generates template letters based on established consumer protection laws. We are not a law firm and do not provide legal advice. For complex legal matters, we recommend consulting with a consumer protection attorney." },
              { q: "How long does the analysis take?", a: "Most analyses complete in under 60 seconds. Complex bills with many line items may take up to 2 minutes." },
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
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-crusher-blue/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Stop Overpaying.<br />Start Fighting Back.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands who&apos;ve saved money on their medical bills and defeated unfair collections.
          </p>
          <a href="/analyze" className="inline-block bg-crusher-blue hover:bg-crusher-blue-dark text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 animate-pulse-glow">
            Crush My Bill Now →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2"><img src="/logo.jpg" alt="DebtCrusher" className="h-8 w-8 rounded-lg" /><span className="text-xl font-black text-white">Debt<span className="text-crusher-blue">Crusher</span><span className="text-slate-400 text-sm">.ai</span></span></div>
              <p className="text-slate-400 text-sm mt-2">AI-powered medical bill analysis and debt defense.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/analyze" className="hover:text-white transition-colors">Bill Analyzer</a></li>
                <li><a href="/credit-repair" className="hover:text-white transition-colors">Credit Repair</a></li>
                <li><a href="/analyze" className="hover:text-white transition-colors">Collections Crusher</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@debtcrusher.ai" className="hover:text-white transition-colors">support@debtcrusher.ai</a></li>
                <li><a href="/verify" className="hover:text-white transition-colors">Verify Results</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 DebtCrusher.ai. All rights reserved. Not legal advice. See our <a href="/about" className="text-crusher-blue hover:underline">disclaimer</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
