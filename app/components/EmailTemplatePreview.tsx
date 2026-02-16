"use client";

import { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";

interface EmailTemplatePreviewProps {
  title: string;
  content: string;
  icon: string;
  onCopyClick: () => void;
  isCopied: boolean;
}

export default function EmailTemplatePreview({ 
  title, 
  content, 
  icon, 
  onCopyClick,
  isCopied 
}: EmailTemplatePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!content.trim()) return null;

  // Extract subject line and body
  const lines = content.split('\n');
  const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:')) || '';
  const emailBody = lines.filter(line => !line.toLowerCase().startsWith('subject:')).join('\n').trim();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onCopyClick();
    } catch (error) {
      console.error('Failed to copy email:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      onCopyClick();
    }
  };

  return (
    <div className="glass rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div 
        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              {subjectLine && (
                <p className="text-xs text-slate-400 mt-1">{subjectLine}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCopied ? (
              <span className="text-xs text-crusher-green font-semibold flex items-center gap-1">
                <Check size={14} />
                Copied!
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard();
                }}
                className="text-xs bg-crusher-blue hover:bg-crusher-blue-dark text-white px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1"
              >
                <Copy size={12} />
                Copy Email
              </button>
            )}
            <span className="text-slate-500 text-xs">
              {isExpanded ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4 bg-slate-900/50 rounded-b-xl">
          <div className="space-y-3">
            {/* Subject Line */}
            {subjectLine && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject Line</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {subjectLine.replace(/^subject:\s*/i, '')}
                </p>
              </div>
            )}

            {/* Email Body */}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Body</span>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded border border-slate-700/30">
                {emailBody}
              </div>
            </div>

            {/* Copy Button */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 bg-crusher-blue hover:bg-crusher-blue-dark text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}