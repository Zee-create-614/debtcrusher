"use client";

import { useEffect, useState } from "react";

export default function TawkWidget() {
  const [tawkId, setTawkId] = useState<string | null>(null);

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    if (id) {
      setTawkId(id);
      // Load Tawk.to script
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = `https://embed.tawk.to/${id}/default`;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.head.appendChild(s1);
    }
  }, []);

  // If Tawk isn't configured, show fallback support button
  if (tawkId) return null;

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
