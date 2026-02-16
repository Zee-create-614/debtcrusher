"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from 'next-auth/react';
import LetterPreview from "../../components/LetterPreview";

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
  const { data: session, status } = useSession();
  const [results, setResults] = useState<CreditRepairResult | null>(null);
  const [downloadedLetters, setDownloadedLetters] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [lettersUnlocked, setLettersUnlocked] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [savedToAccount, setSavedToAccount] = useState(false);

  // Replace common placeholder patterns in letter text with actual user info
  const personalizeLetterText = (text: string, userInfo: any): string => {
    if (!text || !userInfo) return text;
    const replacements: [RegExp, string][] = [
      [/\[Your Full Name\]/gi, userInfo.fullName || ''],
      [/\[Your Name\]/gi, userInfo.fullName || ''],
      [/\[Full Name\]/gi, userInfo.fullName || ''],
      [/\[NAME\]/gi, userInfo.fullName || ''],
      [/\[Your Street Address\]/gi, userInfo.streetAddress || ''],
      [/\[Your Address\]/gi, userInfo.streetAddress || ''],
      [/\[Street Address\]/gi, userInfo.streetAddress || ''],
      [/\[ADDRESS\]/gi, userInfo.streetAddress || ''],
      [/\[Your City\]/gi, userInfo.city || ''],
      [/\[City\]/gi, userInfo.city || ''],
      [/\[Your State\]/gi, userInfo.state || ''],
      [/\[State\]/gi, userInfo.state || ''],
      [/\[Your ZIP\]/gi, userInfo.zipCode || ''],
      [/\[Your Zip Code\]/gi, userInfo.zipCode || ''],
      [/\[ZIP Code\]/gi, userInfo.zipCode || ''],
      [/\[ZIP\]/gi, userInfo.zipCode || ''],
      [/\[City, State ZIP\]/gi, `${userInfo.city || ''}, ${userInfo.state || ''} ${userInfo.zipCode || ''}`],
      [/\[City, State, ZIP\]/gi, `${userInfo.city || ''}, ${userInfo.state || ''} ${userInfo.zipCode || ''}`],
      [/\[City, State, Zip Code\]/gi, `${userInfo.city || ''}, ${userInfo.state || ''} ${userInfo.zipCode || ''}`],
      [/\[Last 4 of SSN\]/gi, userInfo.last4ssn || ''],
      [/\[Last 4 SSN\]/gi, userInfo.last4ssn || ''],
      [/\[SSN Last 4\]/gi, userInfo.last4ssn || ''],
      [/XXX-XX-/g, `XXX-XX-${userInfo.last4ssn || 'XXXX'}`],
    ];
    let result = text;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }
    return result;
  };

  // Apply personalization to all letters in results
  const personalizeResults = (data: CreditRepairResult, userInfo: any): CreditRepairResult => {
    if (!userInfo) return data;
    return {
      ...data,
      items: data.items.map(item => ({
        ...item,
        dispute_letters: {
          equifax: personalizeLetterText(item.dispute_letters.equifax, userInfo),
          experian: personalizeLetterText(item.dispute_letters.experian, userInfo),
          transunion: personalizeLetterText(item.dispute_letters.transunion, userInfo),
        },
        goodwill_letter: item.goodwill_letter ? personalizeLetterText(item.goodwill_letter, userInfo) : null,
        pay_for_delete_letter: item.pay_for_delete_letter ? personalizeLetterText(item.pay_for_delete_letter, userInfo) : null,
      })),
    };
  };

  useEffect(() => {
    // Check for unlock parameters from successful payment first
    const urlParams = new URLSearchParams(window.location.search);
    const unlocked = urlParams.get('unlocked');
    if (unlocked === 'letters') {
      setLettersUnlocked(true);
      // Update server-side unlock status
      if (session?.user?.email) {
        updateUnlockStatus(true);
      }
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    // Try to load from sessionStorage first
    const stored = sessionStorage.getItem("creditRepairResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.error || !parsed.items) {
          // sessionStorage is empty/invalid, try to load from server
          if (session?.user?.email) {
            loadFromServer();
          } else {
            setResults(null);
          }
          return;
        }
        // Apply personalization to replace any placeholder text
        const userInfo = parsed.user_info;
        const personalizedResults = userInfo ? personalizeResults(parsed, userInfo) : parsed;
        setResults(personalizedResults);

        // Auto-save if user is logged in
        if (session?.user?.email) {
          saveToServer(parsed);
          saveToAccount(personalizedResults);
        } else {
          // Show account prompt after 3 seconds if not logged in
          setTimeout(() => setShowAccountPrompt(true), 3000);
        }
      } catch {
        // sessionStorage parsing failed, try server if authenticated
        if (session?.user?.email) {
          loadFromServer();
        } else {
          setResults(null);
        }
      }
    } else if (session?.user?.email) {
      // No sessionStorage data, try to load from server
      loadFromServer();
    }
  }, [session]);

  const saveToServer = async (analysisData?: CreditRepairResult) => {
    if (!session?.user?.email) return;
    
    const dataToSave = analysisData || results;
    if (!dataToSave) return;

    try {
      await fetch('/api/user/credit-repair-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: dataToSave,
        }),
      });
    } catch (error) {
      console.error('Failed to save results to server:', error);
    }
  };

  const loadFromServer = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/user/credit-repair-results');
      if (response.ok) {
        const data = await response.json();
        // Apply personalization if user_info is present
        const userInfo = data.results?.user_info;
        const personalizedResults = userInfo ? personalizeResults(data.results, userInfo) : data.results;
        setResults(personalizedResults);
        setLettersUnlocked(data.unlocked || false);
        
        // Also save to sessionStorage for immediate access
        sessionStorage.setItem("creditRepairResults", JSON.stringify(data.results));
        
        // Auto-save to account if not already saved
        if (data.results) {
          saveToAccount(data.results);
        }
      } else if (response.status === 404) {
        // No saved results found
        setResults(null);
      }
    } catch (error) {
      console.error('Failed to load results from server:', error);
      setResults(null);
    }
  };

  const updateUnlockStatus = async (unlocked: boolean) => {
    if (!session?.user?.email) return;

    try {
      await fetch('/api/user/credit-repair-results', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlocked,
        }),
      });
    } catch (error) {
      console.error('Failed to update unlock status:', error);
    }
  };

  const saveToAccount = async (analysisData?: CreditRepairResult) => {
    if (!session?.user?.email) return;
    
    const dataToSave = analysisData || results;
    if (!dataToSave) return;

    // Personalize letters before saving so dashboard shows clean data
    const userInfo = (dataToSave as any).user_info;
    const personalizedData = userInfo ? personalizeResults(dataToSave, userInfo) : dataToSave;

    try {
      const response = await fetch('/api/user/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'credit',
          summary: `Credit repair analysis - ${personalizedData.total_disputable} disputable items found`,
          itemsDisputed: personalizedData.total_disputable,
          results: personalizedData,
        }),
      });

      if (response.ok) {
        setSavedToAccount(true);
        setShowAccountPrompt(false);
      }
    } catch (error) {
      console.error('Failed to save to account:', error);
    }
  };

  const handleCreateAccount = () => {
    signIn();
  };

  const handleUnlockLetters = async () => {
    // Check if user is authenticated
    if (!session?.user) {
      // Redirect to sign-in page
      signIn();
      return;
    }

    // Save results to server before redirecting to checkout
    if (results) {
      await saveToServer(results);
    }

    try {
      // Track credit letters unlock intent
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "credit_letters_unlock_intent",
            data: {
              itemsCount: results?.total_disputable || 0,
              estimatedScoreImprovement: results?.estimated_total_score_improvement || 0
            },
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: 'credit_repair_unlock',
          amount: 10, // $0.10 in cents (testing)
          description: `Unlock All ${allLetters.length} Dispute Letters - DebtCrusher.ai`,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
          userEmail: session?.user?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Authentication required - redirect to sign in
          alert('Please sign in to your account before making a purchase.');
          signIn();
          return;
        }
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

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

  const handleLetterDownload = (letterTitle: string) => {
    setDownloadedLetters((prev) => new Set([...prev, letterTitle]));
  };

  const toggleItem = (idx: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const undownloadedCount = allLetters.filter((l) => !downloadedLetters.has(l.title)).length;
  const allDownloaded = undownloadedCount === 0;

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

        {/* Account Save Prompt */}
        {showAccountPrompt && !session?.user && (
          <div className="glass-strong rounded-2xl p-6 mb-8 border border-green-700/50 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="bg-green-900/30 rounded-full p-3 flex-shrink-0">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Save Your Credit Repair Analysis!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create a free account to save this analysis, track your disputes, and monitor your progress.
                  We found <strong>{results?.total_disputable} disputable items</strong> with potential for 
                  <strong> +{results?.estimated_total_score_improvement} point score improvement</strong> — 
                  don't lose this valuable information!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateAccount}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => setShowAccountPrompt(false)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Saved Confirmation */}
        {savedToAccount && session?.user && (
          <div className="glass rounded-2xl p-4 mb-8 border border-green-700/50 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="bg-green-900/30 rounded-full p-2 flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-green-200 text-sm font-medium">
                  ✅ Credit repair analysis saved to your account. <a href="/account" className="text-green-400 hover:text-green-300 underline">View all analyses →</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-3">🤖 AI Analysis</h2>
          <p className="text-slate-300 leading-relaxed">{results.summary}</p>
        </div>

        {/* Disputable Items — Free Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 animate-fade-in-up">🎯 Disputable Items</h2>
          <div className="space-y-4">
            {results.items.map((item, idx) => (
              <div
                key={idx}
                className={`glass rounded-2xl overflow-hidden border-l-4 ${typeColors[item.type] || "border-slate-500/40"} animate-fade-in-up`}
              >
                {/* Item Header — always visible */}
                <button
                  onClick={() => lettersUnlocked ? toggleItem(idx) : undefined}
                  className={`w-full p-5 text-left ${lettersUnlocked ? "hover:bg-slate-800/30 cursor-pointer" : "cursor-default"} transition-colors`}
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
                    {lettersUnlocked && (
                      <span className="text-slate-400 text-lg shrink-0">{expandedItems.has(idx) ? "▲" : "▼"}</span>
                    )}
                  </div>
                </button>

                {/* Expanded: Letters — only if unlocked */}
                {lettersUnlocked && expandedItems.has(idx) && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-700/50 pt-4">
                    <h4 className="text-white font-semibold text-sm mb-2">📬 Dispute Letters</h4>

                    {(["equifax", "experian", "transunion"] as const).map((bureau) =>
                      item.dispute_letters[bureau] ? (
                        <LetterPreview
                          key={`${idx}-${bureau}`}
                          title={`${BUREAU_ADDRESSES[bureau].name} Dispute`}
                          content={item.dispute_letters[bureau]}
                          icon="📊"
                          isSent={downloadedLetters.has(`${item.account} — ${BUREAU_ADDRESSES[bureau].name} Dispute`)}
                          onDownloadClick={() =>
                            handleLetterDownload(`${item.account} — ${BUREAU_ADDRESSES[bureau].name} Dispute`)
                          }
                        />
                      ) : null
                    )}

                    {item.goodwill_letter && (
                      <LetterPreview
                        title="Goodwill Letter"
                        content={item.goodwill_letter}
                        icon="🤝"
                        isSent={downloadedLetters.has(`${item.account} — Goodwill Letter`)}
                        onDownloadClick={() =>
                          handleLetterDownload(`${item.account} — Goodwill Letter`)
                        }
                      />
                    )}

                    {item.pay_for_delete_letter && (
                      <LetterPreview
                        title="Pay-for-Delete Letter"
                        content={item.pay_for_delete_letter}
                        icon="💰"
                        isSent={downloadedLetters.has(`${item.account} — Pay-for-Delete Letter`)}
                        onDownloadClick={() =>
                          handleLetterDownload(`${item.account} — Pay-for-Delete Letter`)
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unlock Paywall or Send ALL */}
        <div className="mb-8">
          {!lettersUnlocked ? (
            <div className="glass-strong rounded-2xl p-8 text-center border border-crusher-blue/30">
              <span className="text-5xl block mb-4">🔓</span>
              <h3 className="text-2xl font-black text-white mb-2">Unlock Your Dispute Letters</h3>
              <p className="text-slate-400 mb-2">
                We found <span className="text-crusher-blue font-bold">{results.total_disputable} disputable items</span> that could improve your score by <span className="text-crusher-green font-bold">+{results.estimated_total_score_improvement} points</span>.
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Get all {allLetters.length} dispute letters as downloadable PDFs — FCRA-compliant, personalized, ready to print and mail to Equifax, Experian, and TransUnion.
              </p>
              <button
                onClick={handleUnlockLetters}
                className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-crusher-blue/25"
              >
                🔓 Unlock All Dispute Letters — $0.10
              </button>
              <p className="text-slate-500 text-xs mt-3">Includes dispute letters, goodwill letters, and pay-for-delete letters as downloadable PDFs</p>
            </div>
          ) : (
            <div className="glass rounded-xl p-5 text-center border border-crusher-blue/30">
              <h3 className="text-xl font-bold text-white mb-3">📄 Download Your Letters</h3>
              <p className="text-slate-400 mb-4">
                Your personalized dispute letters are ready to download as PDFs. Print and send them via certified mail yourself, or download all letters in one combined PDF.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Download all letters as one combined PDF
                    const combinedContent = allLetters.map(letter => 
                      `${letter.title}\n\n${letter.content}\n\n---\n\n`
                    ).join('');
                    
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>All Dispute Letters</title>
                          <style>
                            body { 
                              font-family: 'Times New Roman', serif; 
                              margin: 40px; 
                              line-height: 1.6; 
                              color: #000;
                            }
                            .letter { 
                              page-break-after: always; 
                              margin-bottom: 40px; 
                            }
                            .letter-title { 
                              text-align: center; 
                              font-size: 18px; 
                              font-weight: bold; 
                              margin-bottom: 30px; 
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
                          ${allLetters.map(letter => `
                            <div class="letter">
                              <div class="letter-title">${letter.title}</div>
                              <div class="letter-content">${letter.content}</div>
                            </div>
                          `).join('')}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="flex-1 bg-crusher-blue hover:bg-crusher-blue-dark text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
                >
                  📄 Download All Letters as PDF
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Individual letters can be downloaded from the expanded sections above
              </p>
            </div>
          )}
        </div>

        {/* Credit Score Tips — only after unlock */}
        {lettersUnlocked && results.tips && results.tips.length > 0 && (
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

        {/* Verify CTA */}
        <div className="glass rounded-xl p-5 text-center mb-6 border border-crusher-green/20 animate-fade-in-up">
          <a href="/verify" className="text-crusher-green hover:text-white font-semibold transition-colors">
            🔍 Come back in 60 days to verify your results and claim your money-back guarantee →
          </a>
        </div>

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

      {/* PDF Download functionality integrated into LetterPreview components */}
    </div>
  );
}
