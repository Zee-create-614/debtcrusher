export default function AboutPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            About <span className="text-crusher-blue">DebtCrusher</span>.ai
          </h1>
          <p className="text-slate-400 text-lg">
            Making debt negotiation accessible to everyone.
          </p>
        </div>

        <div className="space-y-12">
          {/* Mission */}
          <section className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">⚡ Our Mission</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              The American healthcare billing system is broken. 80% of medical bills contain errors. Collections agencies routinely pursue debts they can&apos;t legally collect. And most people don&apos;t have the knowledge or resources to fight back.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              DebtCrusher.ai exists to level the playing field. We use artificial intelligence to analyze bills, identify errors, and generate the same dispute letters and legal documents that expensive attorneys would — but for a fraction of the cost.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Everyone deserves the tools to defend themselves against unfair billing practices. That&apos;s what we&apos;re building.
            </p>
          </section>

          {/* How AI Works */}
          <section className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">🤖 How Our AI Works</h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>Our AI engine analyzes your bills through multiple layers:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-crusher-blue mt-1">1.</span>
                  <span><strong className="text-white">CPT Code Verification</strong> — Every billing code is cross-referenced against fair market rates and Medicare reimbursement schedules to identify overcharges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crusher-blue mt-1">2.</span>
                  <span><strong className="text-white">Duplicate Detection</strong> — We scan for duplicate charges, unbundling violations, and other common billing errors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crusher-blue mt-1">3.</span>
                  <span><strong className="text-white">Legal Analysis</strong> — For collections, we check statute of limitations, FDCPA compliance, and identify potential violations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-crusher-blue mt-1">4.</span>
                  <span><strong className="text-white">Document Generation</strong> — Based on the analysis, we generate customized dispute letters, settlement offers, and negotiation scripts.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">🔒 Privacy &amp; Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "🔐", title: "256-bit Encryption", desc: "All data is encrypted in transit and at rest using bank-level AES-256 encryption." },
                { icon: "🗑️", title: "Auto-Delete", desc: "Your uploaded bills and analysis data are automatically deleted after processing. We don't keep copies." },
                { icon: "⚖️", title: "HIPAA Compliant", desc: "Our systems are designed to meet HIPAA requirements for handling protected health information." },
                { icon: "🚫", title: "Never Sold", desc: "We never sell, share, or monetize your personal data or medical information. Period." },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <section className="glass rounded-2xl p-8 border border-crusher-gold/20">
            <h2 className="text-2xl font-black text-white mb-4">⚠️ Important Disclaimer</h2>
            <div className="text-slate-300 leading-relaxed space-y-4">
              <p>
                <strong className="text-white">DebtCrusher.ai is not a law firm and does not provide legal advice.</strong> The information, letters, and documents generated by our service are for educational and informational purposes only.
              </p>
              <p>
                Our AI-generated dispute letters and analysis are based on publicly available information about consumer protection laws, fair billing practices, and common billing errors. They should not be considered a substitute for professional legal advice.
              </p>
              <p>
                If you are facing a lawsuit, have a complex legal situation, or need legal representation, we strongly recommend consulting with a licensed consumer protection attorney in your state.
              </p>
              <p>
                Results may vary. Past savings examples are illustrative and do not guarantee future results. The accuracy of our analysis depends on the quality and completeness of the information provided.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center">
            <h2 className="text-2xl font-black text-white mb-4">Questions?</h2>
            <p className="text-slate-400 mb-6">We&apos;re here to help you fight back.</p>
            <a href="mailto:support@debtcrusher.ai" className="inline-block bg-crusher-blue hover:bg-crusher-blue-dark text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105">
              Contact Us: support@debtcrusher.ai
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
