"use client";

import { useEffect, useState } from "react";
import LetterPreview from "../components/LetterPreview";

interface LineItem {
  code: string;
  description: string;
  billed: number;
  fair: number;
  status: "fair" | "overcharged" | "error";
  savings: number;
}

interface AnalysisResult {
  summary: {
    totalBilled: number;
    totalFair: number;
    totalSavings: number;
    savingsPercent: number;
    settlementAmount: number;
    settlementPercent: number;
  };
  lineItems: LineItem[];
  statuteOfLimitations: {
    state: string;
    yearsWritten: number;
    yearsOral: number;
    debtAge: string;
    debtAgeYears: number;
    isExpired: boolean;
    message: string;
  };
  fdcpaViolations: { violation: string; statute: string; severity: string }[];
  letters: {
    dispute: string;
    validation: string;
    settlement: string;
    creditDispute: {
      equifax: string;
      experian: string;
      transunion: string;
    };
  };
  negotiationScript: string[];
  debtType: string;
  creditor: string;
  amount: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="text-2xl font-bold text-white mb-2">No Analysis Found</h1>
          <p className="text-slate-400 mb-6">Analyze a bill first to see your results.</p>
          <a href="/analyze" className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-all">
            Analyze a Bill →
          </a>
        </div>
      </div>
    );
  }

  const { summary, lineItems, statuteOfLimitations, fdcpaViolations, letters, negotiationScript } = results;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Savings Banner */}
        <div className="glass-strong rounded-2xl p-8 text-center mb-8 glow-green animate-fade-in-up">
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Potential Savings Found</p>
          <p className="text-5xl md:text-7xl font-black text-crusher-green mb-2">
            ${summary.totalSavings.toLocaleString()}
          </p>
          <p className="text-slate-400">
            {summary.savingsPercent}% less than what you were billed
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <p className="text-crusher-red font-bold text-xl">${summary.totalBilled.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">Billed</p>
            </div>
            <div className="text-3xl text-slate-600">→</div>
            <div>
              <p className="text-crusher-green font-bold text-xl">${summary.totalFair.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">Fair Price</p>
            </div>
          </div>
        </div>

        {/* Settlement Recommendation */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up-delay">
          <h2 className="text-xl font-bold text-white mb-3">💰 Settlement Recommendation</h2>
          <p className="text-slate-300">
            Based on debt age and type, we recommend offering{" "}
            <span className="text-crusher-green font-black text-2xl">${summary.settlementAmount.toLocaleString()}</span>
            {" "}({summary.settlementPercent}% of the ${results.amount.toLocaleString()} balance).
          </p>
        </div>

        {/* Bill Breakdown */}
        {lineItems.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up-delay">
            <h2 className="text-xl font-bold text-white mb-4">📋 Bill Breakdown</h2>
            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{item.status === "fair" ? "✅" : item.status === "overcharged" ? "⚠️" : "❌"}</span>
                      <span className="text-white font-semibold text-sm">{item.description}</span>
                    </div>
                    <span className="text-slate-400 text-xs">CPT {item.code}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-crusher-red font-bold">${item.billed.toLocaleString()}</p>
                    <p className="text-crusher-green text-sm">Fair: ${item.fair.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statute of Limitations */}
        <div className={`glass rounded-2xl p-6 mb-8 ${statuteOfLimitations.isExpired ? 'border border-crusher-green/30' : ''}`}>
          <h2 className="text-xl font-bold text-white mb-3">⏰ Statute of Limitations</h2>
          <p className="text-slate-300">{statuteOfLimitations.message}</p>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="text-slate-400">State:</span>{" "}
              <span className="text-white font-semibold">{statuteOfLimitations.state}</span>
            </div>
            <div>
              <span className="text-slate-400">Written:</span>{" "}
              <span className="text-white font-semibold">{statuteOfLimitations.yearsWritten} years</span>
            </div>
            <div>
              <span className="text-slate-400">Debt Age:</span>{" "}
              <span className="text-white font-semibold">{statuteOfLimitations.debtAge}</span>
            </div>
          </div>
        </div>

        {/* FDCPA Violations */}
        {fdcpaViolations.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 border border-crusher-red/30">
            <h2 className="text-xl font-bold text-white mb-3">🚨 FDCPA Violations Detected</h2>
            <div className="space-y-3">
              {fdcpaViolations.map((v, i) => (
                <div key={i} className="bg-crusher-red/10 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm">{v.violation}</p>
                  <p className="text-slate-400 text-xs mt-1">{v.statute} • Severity: {v.severity}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Each FDCPA violation may entitle you to up to $1,000 in statutory damages plus attorney fees.
            </p>
          </div>
        )}

        {/* Defense Arsenal */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6">⚔️ Your Defense Arsenal</h2>
          <div className="space-y-3">
            <LetterPreview title="Dispute Letter" content={letters.dispute} icon="📝" />
            <LetterPreview title="Debt Validation Letter" content={letters.validation} icon="✉️" />
            <LetterPreview title={`Settlement Offer ($${summary.settlementAmount.toLocaleString()})`} content={letters.settlement} icon="🤝" />
            <LetterPreview title="Credit Dispute — Equifax" content={letters.creditDispute.equifax} icon="📊" />
            <LetterPreview title="Credit Dispute — Experian" content={letters.creditDispute.experian} icon="📊" />
            <LetterPreview title="Credit Dispute — TransUnion" content={letters.creditDispute.transunion} icon="📊" />
          </div>
        </div>

        {/* Negotiation Script */}
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📞 Negotiation Script</h2>
          <div className="space-y-4">
            {negotiationScript.map((step, i) => (
              <div key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="text-crusher-blue font-bold shrink-0">#{i + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-crusher-blue hover:bg-crusher-blue-dark text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105">
            📥 Download All (PDF)
          </button>
          <a href="/analyze" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 text-center">
            🔄 Analyze Another Bill
          </a>
        </div>
      </div>
    </div>
  );
}
