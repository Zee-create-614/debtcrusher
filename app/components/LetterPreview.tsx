"use client";

import { useState } from "react";

interface LetterPreviewProps {
  title: string;
  content: string;
  icon: string;
  isSent?: boolean;
  onDownloadClick?: () => void;
}

export default function LetterPreview({ title, content, icon, isSent, onDownloadClick }: LetterPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = () => {
    // Create a new window for printing/PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #000;
            }
            h1 { 
              text-align: center; 
              margin-bottom: 30px; 
              font-size: 18px;
            }
            .letter-content { 
              white-space: pre-wrap; 
              font-size: 12pt; 
            }
            @media print {
              body { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="letter-content">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    
    // Call the callback if provided
    if (onDownloadClick) {
      onDownloadClick();
    }
  };

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
        {onDownloadClick && !isSent && (
          <button
            onClick={handleDownloadPDF}
            className="ml-3 bg-crusher-blue/10 hover:bg-crusher-blue/20 text-crusher-blue border border-crusher-blue/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 whitespace-nowrap"
          >
            📄 Download PDF
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
            <button
              onClick={handleDownloadPDF}
              className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              📄 Download PDF
            </button>
            {/* Send functionality replaced with PDF download */}
          </div>
        </div>
      )}
    </div>
  );
}
