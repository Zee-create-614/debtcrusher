"use client";

import { useState } from "react";

interface LetterPreviewProps {
  title: string;
  content: string;
  icon: string;
  isSent?: boolean;
  onSendClick?: () => void;
}

export default function LetterPreview({ title, content, icon, isSent, onSendClick }: LetterPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
          {isSent && (
            <span className="bg-crusher-green/20 text-crusher-green text-xs font-bold px-2 py-0.5 rounded-full">✅ Sent</span>
          )}
          <span className="text-slate-400 ml-auto">{expanded ? '▲' : '▼'}</span>
        </button>
        {onSendClick && !isSent && (
          <button
            onClick={onSendClick}
            className="ml-3 bg-crusher-green/10 hover:bg-crusher-green/20 text-crusher-green border border-crusher-green/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 whitespace-nowrap"
          >
            📬 Send — $7.99
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-5 pb-5">
          <pre className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
            {content}
          </pre>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleCopy}
              className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              📥 Download
            </button>
            {onSendClick && !isSent && (
              <button
                onClick={onSendClick}
                className="bg-crusher-green hover:brightness-110 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                📬 Send Certified Mail
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
