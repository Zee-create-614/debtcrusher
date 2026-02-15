"use client";

import { useState } from "react";

interface LetterPreviewProps {
  title: string;
  content: string;
  icon: string;
}

export default function LetterPreview({ title, content, icon }: LetterPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>
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
          </div>
        </div>
      )}
    </div>
  );
}
