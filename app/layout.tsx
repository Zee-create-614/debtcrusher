import type { Metadata } from "next";
import "./globals.css";
import TawkWidget from "./components/TawkWidget";
import Providers from "./components/Providers";
import AuthButton from "./components/AuthButton";

export const metadata: Metadata = {
  title: "DebtCrusher.ai — Crush Your Medical Bills & Collections",
  description: "AI-powered medical bill analysis and debt collections negotiation. Find overcharges, generate dispute letters, and fight back against unfair debt. Stop overpaying. Start fighting back.",
  keywords: ["medical bill analyzer", "debt collections", "dispute letter generator", "FDCPA", "medical bill errors", "debt negotiation", "collections defense"],
  openGraph: {
    title: "DebtCrusher.ai — Stop Overpaying. Start Fighting Back.",
    description: "AI-powered medical bill analysis finds errors and generates dispute letters. Average savings: $2,400.",
    url: "https://debtcrusher.ai",
    siteName: "DebtCrusher.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DebtCrusher.ai — Crush Your Medical Bills",
    description: "AI finds billing errors and generates dispute letters. Average savings: $2,400.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased min-h-screen">
        <Providers>
          <nav className="fixed top-0 w-full z-50 glass-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="DebtCrusher" className="h-9 w-9 rounded-lg" />
                  <span className="text-xl font-black text-white">Debt<span className="text-crusher-blue">Crusher</span><span className="text-slate-400 text-sm">.ai</span></span>
                </a>
                <div className="hidden md:flex items-center gap-6">
                  <a href="/analyze" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Analyze Bill</a>
                  <a href="/credit-repair" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Credit Repair</a>
                  <a href="/verify" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Verify Results</a>
                  <a href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
                  <a href="/about" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">About</a>
                  <AuthButton />
                </div>
                <div className="md:hidden flex items-center gap-2">
                  <AuthButton />
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">
            {children}
          </main>
          <footer className="bg-gray-900 border-t border-gray-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold text-white mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                    <li><a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                    <li><a href="/disclaimer" className="text-gray-400 hover:text-white text-sm transition-colors">Legal Disclaimer</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-4">Services</h3>
                  <ul className="space-y-2">
                    <li><a href="/analyze" className="text-gray-400 hover:text-white text-sm transition-colors">Medical Bill Analysis</a></li>
                    <li><a href="/credit-repair" className="text-gray-400 hover:text-white text-sm transition-colors">Credit Repair</a></li>
                    <li><a href="/verify" className="text-gray-400 hover:text-white text-sm transition-colors">Verify Results</a></li>
                    <li><a href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><a href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</a></li>
                    <li><a href="mailto:support@debtcrusher.ai" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-4">Connect</h3>
                  <p className="text-gray-400 text-sm">support@debtcrusher.ai</p>
                  <p className="text-gray-400 text-xs mt-4">
                    Educational tools only.<br />
                    Not legal advice.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  © 2026 DebtCrusher.ai. All rights reserved.
                </p>
                <div className="mt-2">
                  <a href="/admin" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Admin</a>
                </div>
              </div>
            </div>
          </footer>
          <TawkWidget />
        </Providers>
      </body>
    </html>
  );
}
