"use client";

import { useEffect, useState } from "react";
import LetterPreview from "../components/LetterPreview";
import SendLetterModal from "../components/SendLetterModal";

interface LineItem {
  code: string;
  description: string;
  billed: number;
  fair: number;
  status: "fair" | "overcharged" | "error" | "questionable";
  savings: number;
  note?: string;
}

interface AnalysisResult {
  summary: {
    totalBilled: number;
    totalFair: number;
    totalSavings: number;
    savingsPercent: number;
    settlementAmount: number;
    settlementPercent: number;
    riskLevel?: string;
    aiSummary?: string;
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
  fdcpaViolations: { violation: string; statute: string; severity: string; damages?: string }[];
  keyFindings?: string[];
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
  collectorAddress?: string;
}

const BUREAU_ADDRESSES: Record<string, { name: string; address: string; city: string; state: string; zip: string }> = {
  equifax: { name: "Equifax", address: "P.O. Box 740256", city: "Atlanta", state: "GA", zip: "30374" },
  experian: { name: "Experian", address: "P.O. Box 4500", city: "Allen", state: "TX", zip: "75013" },
  transunion: { name: "TransUnion", address: "P.O. Box 2000", city: "Chester", state: "PA", zip: "19016" },
};

type LetterKey = "dispute" | "validation" | "settlement" | "equifax" | "experian" | "transunion";

interface LetterInfo {
  key: LetterKey;
  title: string;
  content: string;
  icon: string;
  prefillTo?: { name?: string; address?: string; city?: string; state?: string; zip?: string };
}

function parseCollectorAddress(results: AnalysisResult): { name?: string; address?: string; city?: string; state?: string; zip?: string } | undefined {
  // Try to extract from creditor field and collectorAddress
  if (!results.creditor) return undefined;
  const prefill: { name?: string; address?: string; city?: string; state?: string; zip?: string } = { name: results.creditor };
  // If the analysis has a collectorAddress field, try to parse it
  if (results.collectorAddress) {
    const parts = results.collectorAddress.split(",").map((s) => s.trim());
    if (parts.length >= 1) prefill.address = parts[0];
    if (parts.length >= 2) prefill.city = parts[1];
    if (parts.length >= 3) {
      const stateZip = parts[2].trim().split(/\s+/);
      if (stateZip.length >= 1) prefill.state = stateZip[0];
      if (stateZip.length >= 2) prefill.zip = stateZip[1];
    }
  }
  return prefill;
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [sentLetters, setSentLetters] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<LetterInfo | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.error || !parsed.summary) {
          setResults(null);
          return;
        }
        setResults(parsed);
      } catch {
        setResults(null);
      }
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

  const { summary, lineItems, statuteOfLimitations, fdcpaViolations, letters, negotiationScript, keyFindings } = results;

  const collectorPrefill = parseCollectorAddress(results);

  const allLetters: LetterInfo[] = [
    { key: "dispute", title: "Dispute Letter", content: letters.dispute, icon: "📝", prefillTo: collectorPrefill },
    { key: "validation", title: "Debt Validation Letter", content: letters.validation, icon: "✉️", prefillTo: collectorPrefill },
    { key: "settlement", title: `Settlement Offer ($${summary.settlementAmount.toLocaleString()})`, content: letters.settlement, icon: "🤝", prefillTo: collectorPrefill },
    { key: "equifax", title: "Credit Dispute — Equifax", content: letters.creditDispute.equifax, icon: "📊", prefillTo: BUREAU_ADDRESSES.equifax },
    { key: "experian", title: "Credit Dispute — Experian", content: letters.creditDispute.experian, icon: "📊", prefillTo: BUREAU_ADDRESSES.experian },
    { key: "transunion", title: "Credit Dispute — TransUnion", content: letters.creditDispute.transunion, icon: "📊", prefillTo: BUREAU_ADDRESSES.transunion },
  ];

  const openSendModal = (letter: LetterInfo) => {
    setActiveLetter(letter);
    setModalOpen(true);
  };

  const handleLetterSent = (letterTitle: string) => {
    setSentLetters((prev) => new Set([...prev, letterTitle]));
  };

  const unsentCount = allLetters.filter((l) => !sentLetters.has(l.title)).length;
  const allSent = unsentCount === 0;

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

        {/* AI Summary */}
        {summary.aiSummary && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-3">🤖 AI Analysis</h2>
            <p className="text-slate-300 leading-relaxed">{summary.aiSummary}</p>
            {summary.riskLevel && (
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                summary.riskLevel === "high" ? "bg-crusher-red/20 text-crusher-red" :
                summary.riskLevel === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-crusher-green/20 text-crusher-green"
              }`}>
                Risk Level: {summary.riskLevel.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Key Findings */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-3">🔑 Key Findings</h2>
            <ul className="space-y-2">
              {keyFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-crusher-blue mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
                      <span>{item.status === "fair" ? "✅" : item.status === "overcharged" ? "⚠️" : item.status === "questionable" ? "❓" : "❌"}</span>
                      <span className="text-white font-semibold text-sm">{item.description}</span>
                    </div>
                    {item.code && <span className="text-slate-400 text-xs">CPT {item.code}</span>}
                    {item.note && <p className="text-slate-500 text-xs mt-1">{item.note}</p>}
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
            {allLetters.map((letter) => (
              <LetterPreview
                key={letter.key}
                title={letter.title}
                content={letter.content}
                icon={letter.icon}
                isSent={sentLetters.has(letter.title)}
                onSendClick={() => openSendModal(letter)}
              />
            ))}
          </div>

          {/* Send ALL Letters Button */}
          <div className="mt-6">
            {allSent ? (
              <div className="glass rounded-xl p-5 text-center border border-crusher-green/30">
                <p className="text-crusher-green font-bold text-lg">✅ All Letters Sent!</p>
                <p className="text-slate-400 text-sm mt-1">Your certified letters are on their way.</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  // Open modal for first unsent letter (user sends one at a time)
                  const firstUnsent = allLetters.find((l) => !sentLetters.has(l.title));
                  if (firstUnsent) openSendModal(firstUnsent);
                }}
                className="w-full bg-gradient-to-r from-crusher-blue to-crusher-green text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-crusher-blue/25"
              >
                📬 Send ALL Letters — $39.99
                <span className="block text-xs font-normal opacity-80 mt-0.5">
                  {sentLetters.size}/{allLetters.length} sent • {unsentCount} remaining
                </span>
              </button>
            )}
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

      {/* Send Letter Modal */}
      {activeLetter && (
        <SendLetterModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setActiveLetter(null); }}
          letterContent={activeLetter.content}
          letterTitle={activeLetter.title}
          prefillTo={activeLetter.prefillTo}
          onSent={handleLetterSent}
        />
      )}
    </div>
  );
}
