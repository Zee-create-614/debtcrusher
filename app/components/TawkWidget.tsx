"use client";

import { useEffect } from "react";

const TAWK_ID = "6992090c21c0731c38d19e02";

export default function TawkWidget() {
  useEffect(() => {
    if (!TAWK_ID) return;
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${TAWK_ID}/default`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);
    return () => {
      document.head.removeChild(s1);
    };
  }, []);

  if (TAWK_ID) return null;

  return (
    <a
      href="mailto:support@debtcrusher.ai"
      className="fixed bottom-6 right-6 z-50 bg-crusher-blue hover:bg-crusher-blue-dark text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-crusher-blue/25 transition-all hover:scale-110"
      title="Contact Support"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </a>
  );
}
