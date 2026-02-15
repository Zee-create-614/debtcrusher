"use client";

import { useState } from "react";

interface SendLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterContent: string;
  letterTitle: string;
  prefillTo?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  onSent?: (letterTitle: string) => void;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

export default function SendLetterModal({ isOpen, onClose, letterContent, letterTitle, prefillTo, onSent }: SendLetterModalProps) {
  const [step, setStep] = useState<"form" | "preview" | "sending" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<{ id: string; tracking_number: string | null; expected_delivery_date: string | null } | null>(null);

  const [toName, setToName] = useState(prefillTo?.name || "");
  const [toAddress, setToAddress] = useState(prefillTo?.address || "");
  const [toCity, setToCity] = useState(prefillTo?.city || "");
  const [toState, setToState] = useState(prefillTo?.state || "");
  const [toZip, setToZip] = useState(prefillTo?.zip || "");

  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("");
  const [fromZip, setFromZip] = useState("");

  if (!isOpen) return null;

  const inputClass = "w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-crusher-blue focus:ring-1 focus:ring-crusher-blue/50 transition-all placeholder:text-slate-500";
  const labelClass = "text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 block";

  const canSubmit = toName && toAddress && toCity && toState && toZip && fromName && fromAddress && fromCity && fromState && fromZip;

  const handleSend = async () => {
    setStep("sending");
    try {
      const res = await fetch("/api/send-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter_content: letterContent,
          to_name: toName,
          to_address: toAddress,
          to_city: toCity,
          to_state: toState,
          to_zip: toZip,
          from_name: fromName,
          from_address: fromAddress,
          from_city: fromCity,
          from_state: fromState,
          from_zip: fromZip,
          letter_type: letterTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send letter");
        setStep("error");
        return;
      }
      setTrackingInfo(data);
      setStep("success");
      onSent?.(letterTitle);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("form");
    setErrorMsg("");
    setTrackingInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-bold text-white">📬 Send Certified Letter</h2>
            <p className="text-slate-400 text-xs mt-0.5">{letterTitle}</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="p-5">
          {/* Form Step */}
          {step === "form" && (
            <div className="space-y-5">
              {/* To Section */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-crusher-blue/20 text-crusher-blue text-xs flex items-center justify-center font-bold">To</span>
                  Recipient
                </h3>
                <div className="space-y-2.5">
                  <div><label className={labelClass}>Name</label><input className={inputClass} value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Creditor or Bureau Name" /></div>
                  <div><label className={labelClass}>Street Address</label><input className={inputClass} value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="123 Main St" /></div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3"><label className={labelClass}>City</label><input className={inputClass} value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="City" /></div>
                    <div className="col-span-1">
                      <label className={labelClass}>State</label>
                      <select className={inputClass} value={toState} onChange={(e) => setToState(e.target.value)}>
                        <option value="">—</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2"><label className={labelClass}>ZIP</label><input className={inputClass} value={toZip} onChange={(e) => setToZip(e.target.value)} placeholder="12345" /></div>
                  </div>
                </div>
              </div>

              {/* From Section */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-crusher-green/20 text-crusher-green text-xs flex items-center justify-center font-bold">Fr</span>
                  Your Return Address
                </h3>
                <div className="space-y-2.5">
                  <div><label className={labelClass}>Your Name</label><input className={inputClass} value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your Full Name" /></div>
                  <div><label className={labelClass}>Street Address</label><input className={inputClass} value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="456 Your Street" /></div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3"><label className={labelClass}>City</label><input className={inputClass} value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="City" /></div>
                    <div className="col-span-1">
                      <label className={labelClass}>State</label>
                      <select className={inputClass} value={fromState} onChange={(e) => setFromState(e.target.value)}>
                        <option value="">—</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2"><label className={labelClass}>ZIP</label><input className={inputClass} value={fromZip} onChange={(e) => setFromZip(e.target.value)} placeholder="12345" /></div>
                  </div>
                </div>
              </div>

              {/* Price & Preview */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">Certified Mail via USPS</span>
                  <span className="text-crusher-green font-black text-lg">$7.99</span>
                </div>
                <p className="text-slate-500 text-xs">Includes printing, postage, certified mail tracking, and delivery confirmation.</p>
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-300 text-xs font-medium">
                    💳 Payment will be charged when you send this letter
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("preview")}
                disabled={!canSubmit}
                className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
              >
                Preview Letter →
              </button>
            </div>
          )}

          {/* Preview Step */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-4 max-h-60 overflow-y-auto">
                <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono">{letterContent}</pre>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-300 font-semibold">To:</span> {toName}, {toAddress}, {toCity}, {toState} {toZip}</p>
                <p><span className="text-slate-300 font-semibold">From:</span> {fromName}, {fromAddress}, {fromCity}, {fromState} {fromZip}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("form")} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-all">
                  ← Edit
                </button>
                <button onClick={handleSend} className="flex-1 bg-crusher-green hover:brightness-110 text-black py-3 rounded-xl font-bold transition-all hover:scale-[1.02]">
                  📬 Send — $7.99
                </button>
              </div>
            </div>
          )}

          {/* Sending */}
          {step === "sending" && (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">📬</div>
              <p className="text-white font-semibold">Sending your certified letter...</p>
              <p className="text-slate-400 text-sm mt-1">This takes just a moment</p>
            </div>
          )}

          {/* Success */}
          {step === "success" && trackingInfo && (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl mb-2">✅</div>
              <h3 className="text-white font-bold text-lg">Letter Sent!</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-2 text-sm">
                <p className="text-slate-400">Letter ID: <span className="text-white font-mono">{trackingInfo.id}</span></p>
                {trackingInfo.tracking_number && (
                  <p className="text-slate-400">Tracking: <span className="text-crusher-blue font-mono">{trackingInfo.tracking_number}</span></p>
                )}
                {trackingInfo.expected_delivery_date && (
                  <p className="text-slate-400">Est. Delivery: <span className="text-crusher-green font-semibold">{trackingInfo.expected_delivery_date}</span></p>
                )}
              </div>
              <button onClick={handleClose} className="w-full bg-crusher-blue hover:bg-crusher-blue-dark text-white py-3 rounded-xl font-bold transition-all">
                Done
              </button>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl mb-2">❌</div>
              <h3 className="text-white font-bold text-lg">Failed to Send</h3>
              <p className="text-crusher-red text-sm">{errorMsg}</p>
              <button onClick={() => setStep("form")} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all">
                ← Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
