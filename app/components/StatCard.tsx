"use client";

interface StatCardProps {
  value: string;
  label: string;
  icon?: string;
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform">
      {icon && <span className="text-3xl mb-2 block">{icon}</span>}
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}
