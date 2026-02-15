"use client";

import { useEffect, useState } from "react";
import LetterPreview from "../../components/LetterPreview";
import SendLetterModal from "../../components/SendLetterModal";

interface DisputeItem {
  account: string;
  type: "collections" | "late_payment" | "charge_off" | "bankruptcy" | "inquiry" | "other";
  balance: number;
  status: string;
  dispute_reason: string;
  dispute_type: "inaccuracy" | "not_mine" | "time_barred" | "duplicate" | "obsolete" | "mixed_file";
  confidence: "high" | "medium" | "low";
  estimated_score_impact: number;
  dispute_letters: {
    equifax: string;
    experian: string;
    transunion: string;
  };
  goodwill_letter: string | null;
  pay_for_delete_letter: string | null;
}

interface CreditRepairResult {
  items: DisputeItem[];
  summary: string;
  total_disputable: number;
  estimated_total_score_improvement: number;
  tips: string[];
}

const BUREAU_ADDRESSES: Record<string, { name: string; address: string; city: string; state: string; zip: string }> = {
  equifax: { name: "Equifax", address: "P.O. Box 740256", city: "Atlanta", state: "GA", zip: "30374" },
  experian: { name: "Experian", address: "P.O. Box 4500", city: "Allen", state: "TX", zip: "75013" },
  transunion: { name: "TransUnion", address: "P.O. Box 2000", city: "Chester", state: "PA", zip: "19016" },
};

interface LetterInfo {
  key: string;
  title: string;
  content: string;
  icon: string;
  prefillTo?: { name?: string; address?: string; city?: string; state?: string; zip?: string };
}

const typeLabels: Record<string, string> = {
  collections: "Collections",
  late_payment: "Late Payment",
  charge_off: "Charge-off",
  bankruptcy: "Bankruptcy",
  inquiry: "Inquiry",
  other: "Other",
};

const disputeTypeLabels: Record<string, string> = {
  inaccuracy: "Inaccuracy",
  not_mine: "Not Mine",
  time_barred: "Time-Barred",
  duplicate: "Duplicate",
  obsolete: "Obsolete",
  mixed_file: "Mixed File",
};

const confidenceColors: Record<string, string> = {
  high: "bg-crusher-green/20 text-crusher-green",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-slate-500/20 text-slate-400",
};

const typeColors: Record<string, string> = {
  collections: "border-crusher-red/40",
  late_payment: "border-yellow-500/40",
  charge_off: "border-crusher-red/40",
  bankruptcy: "border-red-700/40",
  inquiry: "border-slate-500/40",
  other: "border-slate-500/40",
};

export default function CreditRepairResultsPage() {
  const [results, setResults] = useState<CreditRepairResult | null>(null);
  const [sentLetters, setSentLetters] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<LetterInfo | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const stored = sessionStorage.getItem("creditRepairResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.error || !parsed.items) {
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
          <h1 className="text-2xl font-bold text-white mb-2">No Credit Report Analysis Found</h1>
          <p className="text-slate-400 mb-6">Analyze your credit report first to see results.</p>
          <a href="/credit-repair" className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-all">
            Analyze Credit Report →
          </a>
        </div>
      </div>
    );
  }

  const totalNegativeBalance = results.items.reduce((sum, item) => sum + (item.balance || 0), 0);

  // Build all letters for all items
  const allLetters: LetterInfo[] = [];
  results.items.forEach((item, idx) => {
    const bureaus = ["equifax", "experian", "transunion"] as const;
    bureaus.forEach((bureau) => {
      if (item.dispute_letters[bureau]) {
        allLetters.push({
          key: `item-${idx}-${bureau}`,
          title: `${item.account} — ${BUREAU_ADDRESSES[bureau].name} Dispute`,
          content: item.dispute_letters[bureau],
          icon: "📊",
          prefillTo: BUREAU_ADDRESSES[bureau],
        });
      }
    });
    if (item.goodwill_letter) {
      allLetters.push({
        key: `item-${idx}-goodwill`,
        title: `${item.account} — Goodwill Letter`,
        content: item.goodwill_letter,
        icon: "🤝",
      });
    }
    if (item.pay_for_delete_letter) {
      allLetters.push({
        key: `item-${idx}-pfd`,
        title: `${item.account} — Pay-for-Delete Letter`,
        content: item.pay_for_delete_letter,
        icon: "💰",
      });
    }
  });

  const openSendModal = (letter: LetterInfo) => {
    setActiveLetter(letter);
    setModalOpen(true);
  };

  const handleLetterSent = (letterTitle: string) => {
    setSentLetters((prev) => new Set([...prev, letterTitle]));
  };

  const toggleItem = (idx: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const unsentCount = allLetters.filter((l) => !sentLetters.has(l.title)).length;
  const allSent = unsentCount === 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Summary Banner */}
        <div className="glass-strong rounded-2xl p-8 text-center mb-8 glow animate-fade-in-up">
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Credit Repair Analysis</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-4xl md:text-5xl font-black text-crusher-blue">{results.total_disputable}</p>
              <p className="text-slate-400 text-sm mt-1">Disputable Items</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-crusher-green">+{results.estimated_total_score_improvement}</p>
              <p className="text-slate-400 text-sm mt-1">Est. Score Improvement</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-crusher-red">${totalNegativeBalance.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-1">Total Negative Balances</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-3">🤖 AI Analysis</h2>
          <p className="text-slate-300 leading-relaxed">{results.summary}</p>
        </div>

        {/* Disputable Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 animate-fade-in-up">🎯 Disputable Items</h2>
          <div className="space-y-4">
            {results.items.map((item, idx) => (
              <div
                key={idx}
                className={`glass rounded-2xl overflow-hidden border-l-4 ${typeColors[item.type] || "border-slate-500/40"} animate-fade-in-up`}
              >
                {/* Item Header */}
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full p-5 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold">{item.account}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confidenceColors[item.confidence]}`}>
                          {item.confidence.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-slate-400">
                          {typeLabels[item.type] || item.type}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          {disputeTypeLabels[item.dispute_type] || item.dispute_type}
                        </span>
                        {item.balance > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-crusher-red font-semibold">${item.balance.toLocaleString()}</span>
                          </>
                        )}
                        <span className="text-slate-600">•</span>
                        <span className="text-crusher-green font-semibold">+{item.estimated_score_impact} pts</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">{item.dispute_reason}</p>
                    </div>
                    <span className="text-slate-400 text-lg shrink-0">{expandedItems.has(idx) ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Expanded: Letters */}
                {expandedItems.has(idx) && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-700/50 pt-4">
                    <h4 className="text-white font-semibold text-sm mb-2">📬 Dispute Letters</h4>

                    {/* Bureau dispute letters */}
                    {(["equifax", "experian", "transunion"] as const).map((bureau) =>
                      item.dispute_letters[bureau] ? (
                        <LetterPreview
                          key={`${idx}-${bureau}`}
                          title={`${BUREAU_ADDRESSES[bureau].name} Dispute`}
                          content={item.dispute_letters[bureau]}
                          icon="📊"
                          isSent={sentLetters.has(`${item.account} — ${BUREAU_ADDRESSES[bureau].name} Dispute`)}
                          onSendClick={() =>
                            openSendModal({
                              key: `item-${idx}-${bureau}`,
                              title: `${item.account} — ${BUREAU_ADDRESSES[bureau].name} Dispute`,
                              content: item.dispute_letters[bureau],
                              icon: "📊",
                              prefillTo: BUREAU_ADDRESSES[bureau],
                            })
                          }
                        />
                      ) : null
                    )}

                    {/* Goodwill letter */}
                    {item.goodwill_letter && (
                      <LetterPreview
                        title="Goodwill Letter"
                        content={item.goodwill_letter}
                        icon="🤝"
                        isSent={sentLetters.has(`${item.account} — Goodwill Letter`)}
                        onSendClick={() =>
                          openSendModal({
                            key: `item-${idx}-goodwill`,
                            title: `${item.account} — Goodwill Letter`,
                            content: item.goodwill_letter!,
                            icon: "🤝",
                          })
                        }
                      />
                    )}

                    {/* Pay-for-delete letter */}
                    {item.pay_for_delete_letter && (
                      <LetterPreview
                        title="Pay-for-Delete Letter"
                        content={item.pay_for_delete_letter}
                        icon="💰"
                        isSent={sentLetters.has(`${item.account} — Pay-for-Delete Letter`)}
                        onSendClick={() =>
                          openSendModal({
                            key: `item-${idx}-pfd`,
                            title: `${item.account} — Pay-for-Delete Letter`,
                            content: item.pay_for_delete_letter!,
                            icon: "💰",
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Send ALL Disputes */}
        <div className="mb-8">
          {allSent ? (
            <div className="glass rounded-xl p-5 text-center border border-crusher-green/30">
              <p className="text-crusher-green font-bold text-lg">✅ All Letters Sent!</p>
              <p className="text-slate-400 text-sm mt-1">Your certified dispute letters are on their way to the bureaus.</p>
            </div>
          ) : (
            <button
              onClick={() => {
                const firstUnsent = allLetters.find((l) => !sentLetters.has(l.title));
                if (firstUnsent) openSendModal(firstUnsent);
              }}
              className="w-full bg-gradient-to-r from-crusher-blue to-crusher-green text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-crusher-blue/25"
            >
              📬 Send ALL Disputes — ${(allLetters.length * 7.99).toFixed(2)}
              <span className="block text-xs font-normal opacity-80 mt-0.5">
                {sentLetters.size}/{allLetters.length} sent • {unsentCount} remaining • Certified mail to all 3 bureaus
              </span>
            </button>
          )}
        </div>

        {/* Credit Score Tips */}
        {results.tips && results.tips.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 border border-crusher-blue/20 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-4">💡 Personalized Credit Score Tips</h2>
            <div className="space-y-3">
              {results.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-4">
                  <span className="text-crusher-blue font-bold shrink-0">#{i + 1}</span>
                  <p className="text-slate-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <a href="/credit-repair" className="flex-1 bg-crusher-blue hover:bg-crusher-blue-dark text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 text-center">
            🔄 Analyze Another Report
          </a>
          <a href="/analyze" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 text-center">
            🏥 Also have medical bills? →
          </a>
        </div>
      </div>

      {/* Send Letter Modal */}
      {activeLetter && (
        <SendLetterModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setActiveLetter(null);
          }}
          letterContent={activeLetter.content}
          letterTitle={activeLetter.title}
          prefillTo={activeLetter.prefillTo}
          onSent={handleLetterSent}
        />
      )}
    </div>
  );
}
