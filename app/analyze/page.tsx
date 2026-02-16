"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FileUpload from "../components/FileUpload";
import StateSelector from "../components/StateSelector";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin?callbackUrl=/analyze");
    }
  }, [session, status, router]);

  // User info fields
  const [fullName, setFullName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OH");
  const [zipCode, setZipCode] = useState("");

  // Upload functionality
  const [, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageBase64) {
      alert("Please upload an image of your bill first.");
      return;
    }

    // Validate required user info fields
    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      alert("Please fill in all required fields: Full Name, Street Address, City, State, and ZIP Code.");
      return;
    }

    setLoading(true);
    setLoadingStatus("📸 Reading your bill...");
    
    try {
      const body = {
        type: "Medical" as const,
        description: "Uploaded bill image",
        amount: 0,
        creditor: "Unknown",
        state: state,
        debt_age: "<1 year",
        image_base64: imageBase64,
        image_mime_type: imageMimeType,
        user_info: {
          full_name: fullName,
          street_address: streetAddress,
          city: city,
          state: state,
          zip_code: zipCode,
        },
      };

      setTimeout(() => setLoadingStatus("🔍 Analyzing your bill..."), 3000);

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

      // Track analysis completion
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "analysis_complete",
            data: {
              type: "bill",
              debtType: "Unknown",
              amount: 0,
              state: "Unknown",
              savingsFound: data.savings_found || 0,
              mode: "upload"
            },
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }

      sessionStorage.setItem("analysisResults", JSON.stringify(data));
      router.push("/results");
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
            Analyze Your <span className="text-crusher-blue">Bill</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Upload your bill — our AI does the rest.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-up-delay">
          <div className="space-y-6">
            {/* User Information Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Information</h2>
              <p className="text-slate-400 text-sm mb-4">
                Required for generating dispute letters and negotiation scripts
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-white font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-crusher-blue transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-crusher-blue transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Columbus"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-crusher-blue transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">State *</label>
                  <StateSelector value={state} onChange={setState} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="43215"
                    maxLength={10}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-crusher-blue transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Upload Your Bill</h2>
              <p className="text-slate-400 text-sm mb-4">Upload a screenshot or photo of your bill — our AI reads everything automatically.</p>
            </div>
            
            <FileUpload 
              onFile={(f, base64, mime) => { 
                setFile(f); 
                setImageBase64(base64); 
                setImageMimeType(mime); 
              }} 
            />
            
            <button
              onClick={handleAnalyze}
              disabled={loading || !imageBase64 || !fullName || !streetAddress || !city || !state || !zipCode}
              className="w-full bg-crusher-blue hover:bg-crusher-blue-dark disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              {loading ? `⏳ ${loadingStatus || "Analyzing..."}` : "⚡ Analyze My Bill"}
            </button>
          </div>
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