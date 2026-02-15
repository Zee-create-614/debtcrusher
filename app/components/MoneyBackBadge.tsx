"use client";

export default function MoneyBackBadge() {
  return (
    <a href="/verify" className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 glow-green hover:scale-105 transition-all">
      <span className="text-2xl">🛡️</span>
      <div>
        <p className="text-crusher-green font-bold text-sm">60-Day Money-Back Guarantee</p>
        <p className="text-slate-400 text-xs">We guarantee at least 1 removal — or your money back.</p>
      </div>
    </a>
  );
}
