"use client";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({ name, price, period, description, features, cta, highlighted, badge }: PricingCardProps) {
  return (
    <div className={`relative rounded-2xl p-8 ${highlighted ? 'glass-strong glow border-crusher-blue/30' : 'glass'} transition-all hover:scale-105`}>
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-crusher-blue text-white text-xs font-bold px-4 py-1 rounded-full">
          {badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-black text-white">{price}</span>
        {period && <span className="text-slate-400 text-sm ml-1">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-crusher-green mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href="/analyze"
        className={`block text-center py-3 rounded-xl font-bold transition-all hover:scale-105 ${
          highlighted
            ? 'bg-crusher-blue hover:bg-crusher-blue-dark text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {cta}
      </a>
    </div>
  );
}
