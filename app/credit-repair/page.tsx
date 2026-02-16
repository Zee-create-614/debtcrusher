"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FileUpload from "../components/FileUpload";
import { useRouter } from "next/navigation";

interface UserInfo {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  last4ssn: string;
}

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
];

export default function CreditRepairPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin?callbackUrl=/credit-repair");
    }
  }, [session, status, router]);

  // User information form
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    last4ssn: ""
  });

  // Upload functionality
  const [, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // Load user info from sessionStorage on mount
  useEffect(() => {
    const savedUserInfo = sessionStorage.getItem("creditRepairUserInfo");
    if (savedUserInfo) {
      try {
        setUserInfo(JSON.parse(savedUserInfo));
      } catch (e) {
        console.error("Failed to parse saved user info:", e);
      }
    }
  }, []);

  // Save user info to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("creditRepairUserInfo", JSON.stringify(userInfo));
  }, [userInfo]);

  const updateUserInfo = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const isUserInfoComplete = () => {
    return userInfo.fullName.trim() && 
           userInfo.streetAddress.trim() && 
           userInfo.city.trim() && 
           userInfo.state && 
           userInfo.zipCode.trim() && 
           userInfo.last4ssn.trim().length === 4;
  };

  const handleAnalyze = async () => {
    if (!isUserInfoComplete()) {
      alert("Please fill in all required information fields.");
      return;
    }

    if (!imageBase64) {
      alert("Please upload a credit report image first.");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setLoadingStatus("📸 Reading your credit report...");
    
    try {
      const body = {
        input_type: "image",
        image_base64: imageBase64,
        image_mime_type: imageMimeType,
        user_info: userInfo
      };

      setTimeout(() => { setLoadingStep(1); setLoadingStatus("🔍 Analyzing negative items..."); }, 3000);
      setTimeout(() => { setLoadingStep(2); setLoadingStatus("⚖️ Checking FCRA violations & dispute eligibility..."); }, 7000);
      setTimeout(() => { setLoadingStep(3); setLoadingStatus("📝 Generating personalized dispute letters..."); }, 12000);
      setTimeout(() => { setLoadingStep(4); setLoadingStatus("✨ Finalizing your results..."); }, 18000);

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

      // Track analysis completion
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "analysis_complete",
            data: {
              type: "credit",
              state: userInfo.state,
              mode: "upload",
              itemsCount: data.items?.length || 0,
              totalBalance: data.items?.reduce((sum: number, item: any) => sum + (item.balance || 0), 0) || 0
            },
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }

      // Store results AND user info so letters can be personalized
      sessionStorage.setItem("creditRepairResults", JSON.stringify({ ...data, user_info: userInfo }));
      router.push("/credit-repair/results");
    } catch {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not authenticated, will redirect via useEffect
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting to sign in...</div>
      </div>
    );
  }

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

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-up-delay">
          {/* User Information Form */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Information</h2>
            <p className="text-slate-400 text-sm mb-6">
              This information will be used to pre-fill your dispute letters, making them ready to print and mail.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => updateUserInfo("fullName", e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Street Address *</label>
                <input
                  type="text"
                  value={userInfo.streetAddress}
                  onChange={(e) => updateUserInfo("streetAddress", e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    value={userInfo.city}
                    onChange={(e) => updateUserInfo("city", e.target.value)}
                    placeholder="Columbus"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">State *</label>
                  <select
                    value={userInfo.state}
                    onChange={(e) => updateUserInfo("state", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crusher-blue transition-colors"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={userInfo.zipCode}
                    onChange={(e) => updateUserInfo("zipCode", e.target.value)}
                    placeholder="43215"
                    maxLength={5}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">Last 4 of SSN *</label>
                  <input
                    type="text"
                    value={userInfo.last4ssn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        updateUserInfo("last4ssn", value);
                      }
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-crusher-blue transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Upload Your Credit Report</h2>
              <p className="text-slate-400 text-sm mb-4">Upload a screenshot or PDF of your credit report — our AI reads everything automatically.</p>
            </div>
            
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
              disabled={loading || !imageBase64 || !isUserInfoComplete()}
              className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              {loading ? "Analyzing..." : "⚡ Analyze Credit Report"}
            </button>

            {/* Analysis Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                  {/* Spinning circle */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">AI Analyzing Your Report</h3>
                  <p className="text-blue-400 font-medium mb-6">{loadingStatus}</p>
                  
                  {/* Progress steps */}
                  <div className="space-y-3 text-left">
                    {[
                      "Reading your credit report",
                      "Analyzing negative items",
                      "Checking FCRA violations",
                      "Generating dispute letters",
                      "Finalizing results"
                    ].map((step, i) => (
                      <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i < loadingStep ? 'bg-green-500 text-white' : 
                          i === loadingStep ? 'bg-blue-500 text-white animate-pulse' : 
                          'bg-gray-700 text-gray-500'
                        }`}>
                          {i < loadingStep ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm ${i <= loadingStep ? 'text-white' : 'text-gray-500'}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-6">This usually takes 15-30 seconds</p>
                </div>
              </div>
            )}
            
            {!isUserInfoComplete() && (
              <p className="text-crusher-red text-sm text-center">Please fill in all required information fields above</p>
            )}
          </div>
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