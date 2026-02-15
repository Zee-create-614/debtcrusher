"use client";

export default function MoneyBackBadge() {
  return (
    <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 glow-green">
      <span className="text-2xl">🛡️</span>
      <div>
        <p className="text-crusher-green font-bold text-sm">100% Money-Back Guarantee</p>
        <p className="text-slate-400 text-xs">We find savings or you don&apos;t pay. Period.</p>
      </div>
    </div>
  );
}
