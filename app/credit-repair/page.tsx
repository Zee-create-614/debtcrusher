"use client";

import { useState } from "react";
import FileUpload from "../components/FileUpload";
import StateSelector from "../components/StateSelector";
import AnalysisDisclaimer from "../components/AnalysisDisclaimer";
import { useRouter } from "next/navigation";

type Mode = "upload" | "paste" | "describe";
type AccountType = "Collections" | "Late Payment" | "Charge-off" | "Bankruptcy" | "Inquiry" | "Other";

interface NegativeItem {
  id: string;
  accountName: string;
  accountType: AccountType;
  balance: string;
  dateOpened: string;
  lastActivityDate: string;
  status: string;
  notes: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const emptyItem = (): NegativeItem => ({
  id: generateId(),
  accountName: "",
  accountType: "Collections",
  balance: "",
  dateOpened: "",
  lastActivityDate: "",
  status: "",
  notes: "",
});

export default function CreditRepairPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("upload");
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [state, setState] = useState("");
  const [consented, setConsented] = useState(false);

  // Upload mode
  const [, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // Paste mode
  const [pastedText, setPastedText] = useState("");

  // Describe mode
  const [items, setItems] = useState<NegativeItem[]>([emptyItem()]);

  const addItem = () => setItems([...items, emptyItem()]);

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof NegativeItem, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingStatus("Preparing your data...");
    try {
      let body: Record<string, unknown>;

      if (mode === "upload") {
        if (!imageBase64) {
          alert("Please upload a credit report image first.");
          setLoading(false);
          return;
        }
        setLoadingStatus("📸 Reading your credit report...");
        body = {
          input_type: "image",
          image_base64: imageBase64,
          image_mime_type: imageMimeType,
          state,
        };
        setTimeout(() => setLoadingStatus("🔍 Analyzing negative items..."), 3000);
        setTimeout(() => setLoadingStatus("📝 Generating dispute letters..."), 8000);
      } else if (mode === "paste") {
        setLoadingStatus("🔍 Analyzing your credit report...");
        body = {
          input_type: "text",
          report_text: pastedText,
          state,
        };
      } else {
        setLoadingStatus("🔍 Analyzing your negative items...");
        body = {
          input_type: "manual",
          items: items.map((i) => ({
            account_name: i.accountName,
            account_type: i.accountType,
            balance: parseFloat(i.balance) || 0,
            date_opened: i.dateOpened,
            last_activity_date: i.lastActivityDate,
            status: i.status,
            notes: i.notes,
          })),
          state,
        };
      }

      const res = await fetch("/api/credit-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) {
        alert(`Analysis error: ${data.error}`);
        return;
      }

      sessionStorage.setItem("creditRepairResults", JSON.stringify(data));
      router.push("/credit-repair/results");
    } catch {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modes: { key: Mode; label: string; icon: string }[] = [
    { key: "upload", label: "Upload Report", icon: "📤" },
    { key: "paste", label: "Paste Text", icon: "📋" },
    { key: "describe", label: "Add Items", icon: "✏️" },
  ];

  const canSubmit =
    consented && (mode === "upload"
      ? !!imageBase64
      : mode === "paste"
        ? !!pastedText.trim()
        : items.some((i) => i.accountName.trim()));

  const accountTypes: AccountType[] = ["Collections", "Late Payment", "Charge-off", "Bankruptcy", "Inquiry", "Other"];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Credit <span className="text-crusher-blue">Repair</span> Analyzer
          </h1>
          <p className="text-slate-400 text-lg">
            Upload your credit report — AI automatically finds every disputable item and generates ready-to-send dispute letters.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 bg-slate-900 rounded-xl p-1">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                mode === m.key ? "bg-crusher-blue text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <AnalysisDisclaimer onConsentChange={setConsented} isConsented={consented} />

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-up-delay">
          {/* State selector — only for manual/paste modes */}
          {mode === "describe" && (
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">What state are you in?</label>
              <StateSelector value={state} onChange={setState} />
            </div>
          )}

          {/* Upload Mode */}
          {mode === "upload" && (
            <div className="space-y-6">
              <p className="text-slate-400 text-sm text-center">Upload a screenshot or PDF of your credit report — our AI reads everything automatically.</p>
              <FileUpload
                label="Drop your credit report here"
                onFile={(f, base64, mime) => {
                  setFile(f);
                  setImageBase64(base64);
                  setImageMimeType(mime);
                }}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !imageBase64}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? `⏳ ${loadingStatus}` : "⚡ Analyze Credit Report"}
              </button>
            </div>
          )}

          {/* Paste Mode */}
          {mode === "paste" && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Paste your credit report text</label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={10}
                  placeholder="Paste the full text of your credit report here. Include all accounts, balances, statuses, and any negative items..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !canSubmit}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? `⏳ ${loadingStatus}` : "⚡ Analyze Report"}
              </button>
            </div>
          )}

          {/* Describe Mode */}
          {mode === "describe" && (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-slate-800/50 rounded-xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">Negative Item #{idx + 1}</h3>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-crusher-red text-sm transition-colors"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Account Name</label>
                    <input
                      type="text"
                      value={item.accountName}
                      onChange={(e) => updateItem(item.id, "accountName", e.target.value)}
                      placeholder="e.g., Midland Credit Management, Capital One"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Account Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {accountTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => updateItem(item.id, "accountType", t)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                            item.accountType === t
                              ? "bg-crusher-blue text-white"
                              : "bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Balance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          value={item.balance}
                          onChange={(e) => updateItem(item.id, "balance", e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Status</label>
                      <input
                        type="text"
                        value={item.status}
                        onChange={(e) => updateItem(item.id, "status", e.target.value)}
                        placeholder="e.g., Open, Closed, 60 days late"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Date Opened</label>
                      <input
                        type="date"
                        value={item.dateOpened}
                        onChange={(e) => updateItem(item.id, "dateOpened", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-crusher-blue transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Last Activity Date</label>
                      <input
                        type="date"
                        value={item.lastActivityDate}
                        onChange={(e) => updateItem(item.id, "lastActivityDate", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-crusher-blue transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Notes <span className="text-slate-500">(optional)</span></label>
                    <textarea
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                      rows={2}
                      placeholder="Any additional info — dispute history, collector contact, etc."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors text-sm resize-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addItem}
                className="w-full border-2 border-dashed border-slate-700 hover:border-crusher-blue text-slate-400 hover:text-crusher-blue py-3 rounded-xl font-semibold text-sm transition-all"
              >
                + Add Another Negative Item
              </button>

              <button
                onClick={handleAnalyze}
                disabled={loading || !canSubmit}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                {loading ? `⏳ ${loadingStatus}` : "⚡ Analyze & Generate Dispute Letters"}
              </button>
            </div>
          )}
        </div>

        {/* Get Your Free Credit Report */}
        <div className="glass rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-3">📊 Get Your Free Credit Report</h3>
          <p className="text-slate-400 text-sm mb-4">
            You&apos;re entitled to a <span className="text-white font-semibold">free weekly credit report</span> from all 3 bureaus. Download yours, then upload it here for AI analysis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://www.annualcreditreport.com/index.action"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-crusher-blue/10 border border-crusher-blue/20 rounded-xl p-4 hover:bg-crusher-blue/20 transition-all group"
            >
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-white font-semibold text-sm group-hover:text-crusher-blue transition-colors">AnnualCreditReport.com</p>
                <p className="text-slate-400 text-xs">Official free report — all 3 bureaus at once</p>
              </div>
            </a>
            <a
              href="https://www.equifax.com/personal/credit-report-services/free-credit-reports/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition-all group"
            >
              <span className="text-2xl">🔴</span>
              <div>
                <p className="text-white font-semibold text-sm">Equifax</p>
                <p className="text-slate-400 text-xs">Free weekly report direct</p>
              </div>
            </a>
            <a
              href="https://www.experian.com/consumer-products/free-credit-report.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition-all group"
            >
              <span className="text-2xl">🔵</span>
              <div>
                <p className="text-white font-semibold text-sm">Experian</p>
                <p className="text-slate-400 text-xs">Free report + FICO score</p>
              </div>
            </a>
            <a
              href="https://www.transunion.com/credit-disputes/dispute-your-credit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition-all group"
            >
              <span className="text-2xl">🟢</span>
              <div>
                <p className="text-white font-semibold text-sm">TransUnion</p>
                <p className="text-slate-400 text-xs">Free report + dispute portal</p>
              </div>
            </a>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-slate-400 text-sm">
          <span>🔒 256-bit encrypted</span>
          <span>🗑️ Auto-deleted after analysis</span>
          <span>📜 FCRA-compliant letters</span>
        </div>
      </div>
    </div>
  );
}
