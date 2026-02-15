"use client";

import { useState } from "react";
import FileUpload from "../components/FileUpload";
import StateSelector from "../components/StateSelector";
import AnalysisDisclaimer from "../components/AnalysisDisclaimer";
import { useRouter } from "next/navigation";

type Mode = "upload" | "text" | "describe";
type DebtType = "Medical" | "Credit Card" | "Student Loan" | "Auto" | "Collections" | "Other";

export default function AnalyzePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("upload");
  const [loading, setLoading] = useState(false);
  const [consented, setConsented] = useState(false);

  // Upload mode
  const [, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("");

  // Text mode
  const [pastedText, setPastedText] = useState("");

  // Describe mode
  const [debtType, setDebtType] = useState<DebtType>("Medical");
  const [creditor, setCreditor] = useState("");
  const [amount, setAmount] = useState("");
  const [debtAge, setDebtAge] = useState("");
  const [state, setState] = useState("");
  const [details, setDetails] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      let body;
      if (mode === "describe") {
        body = { type: debtType, creditor, amount: parseFloat(amount) || 0, debt_age: debtAge, state, description: details };
      } else if (mode === "text") {
        body = { type: "Medical" as const, description: pastedText, amount: 0, creditor: "Unknown", state: "OH", debt_age: "<1 year" };
      } else {
        if (!imageBase64) {
          alert("Please upload an image of your bill first.");
          setLoading(false);
          return;
        }
        setLoadingStatus("📸 Reading your bill...");
        body = {
          type: "Medical" as const,
          description: "Uploaded bill image",
          amount: 0,
          creditor: "Unknown",
          state: "OH",
          debt_age: "<1 year",
          image_base64: imageBase64,
          image_mime_type: imageMimeType,
        };
      }

      if (mode === "upload") {
        // After a brief delay, switch status to analyzing
        setTimeout(() => setLoadingStatus("🔍 Analyzing your bill..."), 3000);
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Analysis error: ${data.error}`);
        return;
      }
      sessionStorage.setItem("analysisResults", JSON.stringify(data));
      router.push("/results");
    } catch {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modes: { key: Mode; label: string; icon: string }[] = [
    { key: "upload", label: "Upload Bill", icon: "📤" },
    { key: "text", label: "Paste Text", icon: "📋" },
    { key: "describe", label: "Describe It", icon: "✏️" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Analyze Your <span className="text-crusher-blue">Bill</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Upload, paste, or describe your bill — our AI does the rest.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 bg-slate-900 rounded-xl p-1">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                mode === m.key
                  ? 'bg-crusher-blue text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <AnalysisDisclaimer onConsentChange={setConsented} isConsented={consented} />

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-up-delay">
          {/* Upload Mode */}
          {mode === "upload" && (
            <div className="space-y-6">
              <FileUpload onFile={(f, base64, mime) => { setFile(f); setImageBase64(base64); setImageMimeType(mime); }} />
              <button
                onClick={handleAnalyze}
                disabled={loading || !imageBase64 || !consented}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? `⏳ ${loadingStatus || "Analyzing..."}` : "⚡ Analyze My Bill"}
              </button>
            </div>
          )}

          {/* Text Mode */}
          {mode === "text" && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Paste bill text, email, or collector letter</label>
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  rows={8}
                  placeholder="Paste the content of your bill, collection letter, or any communication from a creditor/collector here..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !pastedText.trim() || !consented}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? "⏳ Analyzing..." : "⚡ Analyze"}
              </button>
            </div>
          )}

          {/* Describe Mode */}
          {mode === "describe" && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">What type of debt?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["Medical", "Credit Card", "Student Loan", "Auto", "Collections", "Other"] as DebtType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setDebtType(t)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        debtType === t
                          ? 'bg-crusher-blue text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Who is the creditor/collector?</label>
                <input
                  type="text"
                  value={creditor}
                  onChange={e => setCreditor(e.target.value)}
                  placeholder="e.g., Mercy Health, Midland Credit Management"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">How much do you owe?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">How old is the debt?</label>
                <select
                  value={debtAge}
                  onChange={e => setDebtAge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crusher-blue transition-colors"
                >
                  <option value="">Select age</option>
                  <option value="<1 year">Less than 1 year</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-7 years">5-7 years</option>
                  <option value="7+ years">7+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">What state are you in?</label>
                <StateSelector value={state} onChange={setState} />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Any other details? <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Any additional context — what happened, what the bill is for, what the collector said, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !amount || !state || !consented}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? "⏳ Crushing..." : "⚡ Crush This Debt"}
              </button>
            </div>
          )}
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-slate-400 text-sm">
          <span>🔒 256-bit encrypted</span>
          <span>🗑️ Auto-deleted after analysis</span>
          <span>⚖️ HIPAA compliant</span>
        </div>
      </div>
    </div>
  );
}
