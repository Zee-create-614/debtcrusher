"use client";

import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";

interface VerifyItem {
  original_item: string;
  status: "removed" | "still_present" | "inconclusive";
  explanation: string;
  estimated_score_impact: number;
}

interface VerifyResult {
  items: VerifyItem[];
  summary: string;
  total_disputed: number;
  total_removed: number;
  total_still_present: number;
  total_inconclusive: number;
  estimated_score_improvement: number;
  eligible_for_refund: boolean;
}

export default function VerifyPage() {
  const [step, setStep] = useState<"input" | "loading" | "results">("input");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [reportText, setReportText] = useState("");
  const [originalDisputes, setOriginalDisputes] = useState("");
  const [results, setResults] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Confetti effect
  useEffect(() => {
    if (results && results.total_removed > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [results]);

  const handleSubmit = async () => {
    if (!originalDisputes.trim()) {
      setError("Please describe what you originally disputed.");
      return;
    }
    if (inputMode === "upload" && !imageData) {
      setError("Please upload your new credit report.");
      return;
    }
    if (inputMode === "paste" && !reportText.trim()) {
      setError("Please paste your new credit report text.");
      return;
    }

    setError("");
    setStep("loading");

    try {
      const payload: Record<string, string> = {
        original_disputes: originalDisputes,
      };

      if (inputMode === "upload" && imageData) {
        payload.input_type = "image";
        payload.image_base64 = imageData.base64;
        payload.image_mime_type = imageData.mimeType;
      } else {
        payload.input_type = "text";
        payload.report_text = reportText;
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setResults(data);
      setStep("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("input");
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "removed": return "✅";
      case "still_present": return "❌";
      default: return "❓";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "removed": return "border-crusher-green/40 bg-crusher-green/5";
      case "still_present": return "border-crusher-red/40 bg-crusher-red/5";
      default: return "border-yellow-500/40 bg-yellow-500/5";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "removed": return "Removed";
      case "still_present": return "Still Present";
      default: return "Inconclusive";
    }
  };

  const refundMailto = `mailto:support@debtcrusher.ai?subject=${encodeURIComponent("Money-Back Guarantee Refund Request")}&body=${encodeURIComponent(
    `Hi DebtCrusher Support,\n\nI'm requesting a refund under the 60-day money-back guarantee.\n\nI disputed ${results?.total_disputed || 0} items and after 60 days, none were removed from my credit report.\n\nPlease process my $9.99 refund.\n\nThank you.`
  )}`;

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse">
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="text-2xl font-bold text-white mb-2">Comparing Reports...</h1>
          <p className="text-slate-400">AI is analyzing your new credit report against your original disputes</p>
          <div className="mt-6 w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-crusher-blue rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (step === "results" && results) {
    return (
      <div className="min-h-screen py-12 relative">
        {/* Confetti overlay */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4"][Math.floor(Math.random() * 6)],
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Banner */}
          <div className={`glass-strong rounded-2xl p-8 text-center mb-8 animate-fade-in-up ${results.total_removed > 0 ? "glow-green" : ""}`}>
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">60-Day Verification Results</p>

            {results.total_removed > 0 ? (
              <>
                <span className="text-6xl block mb-3">🎉</span>
                <p className="text-4xl md:text-5xl font-black text-crusher-green mb-2">
                  {results.total_removed} of {results.total_disputed} Items Removed!
                </p>
                <p className="text-slate-400">
                  Estimated credit score improvement: <span className="text-crusher-green font-bold">+{results.estimated_score_improvement} points</span>
                </p>
              </>
            ) : (
              <>
                <span className="text-6xl block mb-3">📋</span>
                <p className="text-3xl md:text-4xl font-black text-white mb-2">
                  Verification Complete
                </p>
                <p className="text-slate-400">
                  {results.total_disputed} items checked
                </p>
              </>
            )}

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-3xl font-black text-crusher-green">{results.total_removed}</p>
                <p className="text-slate-400 text-sm">Removed ✅</p>
              </div>
              <div>
                <p className="text-3xl font-black text-crusher-red">{results.total_still_present}</p>
                <p className="text-slate-400 text-sm">Still Present ❌</p>
              </div>
              <div>
                <p className="text-3xl font-black text-yellow-400">{results.total_inconclusive}</p>
                <p className="text-slate-400 text-sm">Inconclusive ❓</p>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-3">🤖 Verification Summary</h2>
            <p className="text-slate-300 leading-relaxed">{results.summary}</p>
          </div>

          {/* Per-Item Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-6 animate-fade-in-up">📋 Item-by-Item Results</h2>
            <div className="space-y-4">
              {results.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`glass rounded-2xl p-5 border-l-4 ${statusColor(item.status)} animate-fade-in-up`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{statusIcon(item.status)}</span>
                        <div>
                          <h3 className="text-white font-bold">{item.original_item}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.status === "removed" ? "bg-crusher-green/20 text-crusher-green" :
                            item.status === "still_present" ? "bg-crusher-red/20 text-crusher-red" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {statusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">{item.explanation}</p>
                    </div>
                    {item.status === "removed" && item.estimated_score_impact > 0 && (
                      <span className="text-crusher-green font-bold shrink-0">+{item.estimated_score_impact} pts</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Money-Back Guarantee Section */}
          {results.eligible_for_refund && (
            <div className="glass-strong rounded-2xl p-8 text-center mb-8 border border-yellow-500/30 animate-fade-in-up">
              <span className="text-5xl block mb-4">🛡️</span>
              <h3 className="text-2xl font-black text-white mb-2">Money-Back Guarantee</h3>
              <p className="text-slate-400 mb-4">
                We weren&apos;t able to get at least 1 item removed from your credit report after 60 days. You&apos;re eligible for a full <span className="text-white font-bold">$9.99 refund</span>.
              </p>
              <a
                href={refundMailto}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                🛡️ Claim My Refund
              </a>
              <p className="text-slate-500 text-xs mt-3">Opens your email client with a pre-filled refund request</p>
            </div>
          )}

          {/* Celebration / Next Steps */}
          {results.total_removed > 0 && (
            <div className="glass rounded-2xl p-8 text-center mb-8 border border-crusher-green/30 animate-fade-in-up">
              <span className="text-5xl block mb-4">🏆</span>
              <h3 className="text-2xl font-black text-white mb-2">Congratulations!</h3>
              <p className="text-slate-400 mb-2">
                Your disputes worked! <span className="text-crusher-green font-bold">{results.total_removed} items removed</span> from your credit report.
              </p>
              <p className="text-slate-400">
                Estimated credit score improvement: <span className="text-crusher-green font-black text-2xl">+{results.estimated_score_improvement} points</span>
              </p>
            </div>
          )}

          {/* Still present? Try again */}
          {results.total_still_present > 0 && (
            <div className="glass rounded-2xl p-6 mb-8 border border-crusher-blue/20 animate-fade-in-up">
              <h3 className="text-lg font-bold text-white mb-2">💡 Items Still Present?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Don&apos;t give up! You can dispute again with updated information. Many items are removed on the 2nd or 3rd round of disputes.
              </p>
              <a
                href="/credit-repair"
                className="inline-block bg-crusher-blue hover:bg-crusher-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
              >
                Generate New Dispute Letters →
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/credit-repair" className="flex-1 bg-crusher-blue hover:bg-crusher-blue-dark text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 text-center">
              📊 New Credit Analysis
            </a>
            <a href="/" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 text-center">
              🏠 Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Input step
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="text-5xl block mb-4">🔍</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Verify Your <span className="text-crusher-green">Results</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            It&apos;s been 60 days since you sent your dispute letters. Upload your new credit report to see what was removed.
          </p>
        </div>

        {/* Step 1: Original Disputes */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-white mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-crusher-blue/20 text-crusher-blue font-black text-sm mr-2">1</span>
            What did you originally dispute?
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Paste your original order reference, email confirmation, or describe the items you disputed.
          </p>
          <textarea
            value={originalDisputes}
            onChange={(e) => setOriginalDisputes(e.target.value)}
            placeholder={"Example:\n- Capital One collection $2,340 — disputed as not mine\n- Midland Credit late payment — disputed as inaccurate\n- Hard inquiry from XYZ Bank — disputed as unauthorized"}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 text-sm min-h-[140px] focus:border-crusher-blue focus:outline-none transition-colors resize-y"
          />
        </div>

        {/* Step 2: New Credit Report */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-white mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-crusher-blue/20 text-crusher-blue font-black text-sm mr-2">2</span>
            Upload your NEW credit report
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Pull a fresh report from <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="text-crusher-blue hover:underline">AnnualCreditReport.com</a> (free) and upload it here.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode("upload")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                inputMode === "upload" ? "bg-crusher-blue text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              📄 Upload Image/PDF
            </button>
            <button
              onClick={() => setInputMode("paste")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                inputMode === "paste" ? "bg-crusher-blue text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              📝 Paste Text
            </button>
          </div>

          {inputMode === "upload" ? (
            <FileUpload
              onFile={(_file, base64, mimeType) => {
                setImageData({ base64, mimeType });
              }}
            />
          ) : (
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste your credit report text here..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 text-sm min-h-[200px] focus:border-crusher-blue focus:outline-none transition-colors resize-y"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-crusher-red/10 border border-crusher-red/30 rounded-xl p-4 mb-6 text-crusher-red text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-crusher-green hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-crusher-green/25"
        >
          🔍 Verify My Results
        </button>

        {/* Money-back info */}
        <div className="glass rounded-xl p-5 text-center mt-6 border border-yellow-500/20">
          <p className="text-slate-400 text-sm">
            🛡️ <span className="text-white font-semibold">60-Day Money-Back Guarantee:</span> If none of your disputed items were removed after 60 days, you&apos;re eligible for a full $9.99 refund.
          </p>
        </div>
      </div>
    </div>
  );
}
