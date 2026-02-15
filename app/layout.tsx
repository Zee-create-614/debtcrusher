import type { Metadata } from "next";
import "./globals.css";

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
        <nav className="fixed top-0 w-full z-50 glass-strong">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2">
                <span className="text-2xl font-black text-crusher-blue">⚡</span>
                <span className="text-xl font-black text-white">Debt<span className="text-crusher-blue">Crusher</span><span className="text-slate-400 text-sm">.ai</span></span>
              </a>
              <div className="hidden md:flex items-center gap-8">
                <a href="/analyze" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Analyze Bill</a>
                <a href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
                <a href="/about" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">About</a>
                <a href="/analyze" className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105">
                  Crush My Bill →
                </a>
              </div>
              <a href="/analyze" className="md:hidden bg-crusher-blue text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Analyze →
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
