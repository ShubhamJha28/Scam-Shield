"use client";

import React from "react";
import { ExternalLink, ShieldCheck, Globe } from "lucide-react";
import { useAppContext, LangKey } from "./AppContext";

export function Footer() {
  const { lang, setLang } = useAppContext();

  return (
    <footer className="border-t border-white/10 bg-[#070707] py-12 relative z-10 text-center text-neutral-500 text-xs font-mono">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Official Integrations Section */}
        <div className="space-y-4 border border-white/5 bg-neutral-900/30 p-6 rounded-2xl">
          <h4 className="uppercase tracking-widest text-neutral-400 font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Aligned With Official Nodal Agencies
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="font-serif font-bold text-lg">I4C</span>
              <span className="text-[10px] text-left leading-tight hidden sm:block">Indian Cyber Crime<br/>Coordination Centre</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <a href="https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="font-serif font-bold text-lg">CHAKSHU</span>
              <span className="text-[10px] text-left leading-tight hidden sm:block">Sanchar Saathi<br/>Reporting Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a href="https://www.rbi.org.in/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="font-serif font-bold text-lg">RBI</span>
              <span className="text-[10px] text-left leading-tight hidden sm:block">Sachet Financial<br/>Fraud Alert</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-neutral-900 border border-white/10 rounded-full px-3 py-1.5 text-xs font-mono">
            <Globe className="w-4 h-4 text-neutral-400 mr-2" />
            {(["en", "hi", "bn", "ta"] as LangKey[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full uppercase text-xs transition-colors ${
                  lang === l ? "bg-orange-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p>🛡️ ScamShield • "Think Before You Click. Detect. Understand. Protect."</p>
          <p>Built for citizen cyber-safety in alignment with official 1930 / I4C reporting workflows.</p>
        </div>
      </div>
    </footer>
  );
}
