"use client";

import React from "react";
import Link from "next/link";
import { Shield, Globe, PhoneCall } from "lucide-react";
import { useAppContext, LangKey } from "./AppContext";

export function Navbar() {
  const { lang, setLang, setIsEmergencyOpen } = useAppContext();

  return (
    <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4">
      <nav className="flex items-center justify-between px-5 py-3.5 rounded-full border border-white/10 bg-[#0e0e11]/80 backdrop-blur-xl shadow-2xl shadow-black">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/ScamShield_Logo_Transparent.svg" 
              alt="ScamShield Logo" 
              className="w-10 h-10 object-contain drop-shadow-md"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-white">
                ScamShield
              </span>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-neutral-400">
          <Link href="/analyzer" className="hover:text-white transition-colors">Analyzer</Link>
          <Link href="/threat-intelligence" className="hover:text-white transition-colors">Threat Intelligence</Link>
          <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Admin
          </Link>
          <Link href="/evidence-locker" className="hover:text-white transition-colors">Evidence Locker</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase font-mono tracking-wider bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-all shadow-lg shadow-red-500/10 animate-pulse"
          >
            <PhoneCall className="w-3 h-3" />
            <span className="hidden sm:inline">Helpline: </span>1930
          </button>
        </div>
      </nav>

      <div className="mt-4 overflow-hidden py-2 border border-white/10 bg-[#0e0e11]/90 backdrop-blur-md rounded-full relative max-w-4xl mx-auto shadow-lg shadow-black/50">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[
            "⚠️ Fake Maharashtra Electricity Bill SMS flagged 12s ago",
            "🛡️ Impersonated SBI YONO .xyz gateway neutralized by I4C registry",
            "⚠️ Work-From-Home Task scam intercepted (+91 98234...)",
            "🛡️ Fake Paytm cashback QR code identified with fixed debit payload",
            "⚠️ Courier dispatch package update phishing halted",
          ].map((feed, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span className="inline-block w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              <span>{feed}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
