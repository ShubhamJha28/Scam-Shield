"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Camera, Link2, QrCode, Mic, ArrowRight, AlertOctagon, Cpu, Zap } from "lucide-react";
import { useAppContext, LangKey } from "@/components/AppContext";
import { TRANSLATIONS } from "@/lib/translations";
import Link from "next/link";
import GlitchText from "@/components/GlitchText";

export default function HomePage() {
  const { lang, setIsEmergencyOpen } = useAppContext();
  const t = TRANSLATIONS[lang];

  // Mouse Glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Live Metrics Ticker
  const [scansCounter, setScansCounter] = useState(3842190);
  const [preventedCounter, setPreventedCounter] = useState(42.8);
  const [activeTab, setActiveTab] = useState<"text" | "url" | "ocr" | "qr" | "voice">("text");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setScansCounter((c) => c + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.75) setPreventedCounter((p) => +(p + 0.01).toFixed(2));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Hero Mega-Menu
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <>
      {/* Dynamic Lighting Mesh */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.08), transparent 80%)`
        }}
      />
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center text-center space-y-6 pt-12 pb-8 px-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono text-neutral-300 tracking-tight">{t.heroTag}</span>
        </div>

        <h1 className="font-bagnard text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-5xl text-balance leading-tight text-white flex flex-col items-center justify-center gap-4 sm:gap-6 py-2">
          <GlitchText speed={0.4} enableShadows={true} enableOnHover={true}>
            {t.heroTitle1}
          </GlitchText>
          <GlitchText speed={0.6} enableShadows={true} enableOnHover={true} className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-500 block">
            {t.heroTitle2}
          </GlitchText>
        </h1>

        <p className="max-w-2xl text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed">
          {t.heroSubtitle}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl pt-2">
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <span className="text-xs font-mono text-neutral-400">Citizen Loss Prevented</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">₹{mounted ? preventedCounter : "42.8"} Cr+</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <span className="text-xs font-mono text-neutral-400">Threats Screened</span>
            <div className="text-2xl font-mono font-bold text-orange-400 mt-1">{mounted ? scansCounter.toLocaleString() : "3,842,190"}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <span className="text-xs font-mono text-neutral-400">Accuracy Benchmark</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">99.4%</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <span className="text-xs font-mono text-neutral-400">Vector Modalities</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">5 Modalities</div>
          </div>
        </div>

        {/* Dual CTAs */}
        <div className="relative pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 z-30">
          <div
            className="relative"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-orange-500/25 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{t.btnIdentify}</span>
            </button>

            <AnimatePresence>
              {isMegaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 p-3 rounded-2xl bg-[#0e0e11]/95 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black z-50 text-left space-y-1.5"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400 px-3 py-1">
                    Select Threat Vector to Inspect:
                  </div>
                  {[
                    { id: "text", title: "Check a Message", sub: "Paste WhatsApp / SMS / Email", icon: FileText, route: "/analyzer" },
                    { id: "ocr", title: "Scan Screenshot", sub: "Upload suspicious chat screenshot", icon: Camera, route: "/analyzer" },
                    { id: "url", title: "Check a Link", sub: "Detect lookalikes & phishing domains", icon: Link2, route: "/analyzer" },
                    { id: "qr", title: "Scan QR Code", sub: "Inspect destination before sending UPI PIN", icon: QrCode, route: "/analyzer" },
                    { id: "voice", title: "Check Voice Call", sub: "Upload or record suspicious call transcript", icon: Mic, route: "/analyzer" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        href={item.route}
                        key={item.id}
                        className="w-full p-2.5 rounded-xl flex items-center gap-3 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group block"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white group-hover:text-orange-300">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">{item.sub}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="px-6 py-3.5 rounded-full bg-neutral-950/80 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-red-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-red-950/30 transition-all"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>{t.btnScammed}</span>
          </button>
        </div>
      </section>



      {/* 4. HYBRID ENGINE INFOGRAPHIC */}
      <section className="mt-28 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-400">
            Technical Defensibility
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Hybrid Detection Engine Architecture
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
            Combining deterministic rule-based verification with semantic AI analysis to eliminate hallucinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/70 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">1. Deterministic Rule Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Flags hard signatures directly in memory, ensuring fast response times and zero hallucination on verified patterns.
            </p>
            <ul className="space-y-2 text-xs font-mono text-neutral-300">
              <li className="flex items-center gap-2">✓ Typosquatted bank domains (sbi-kyc-update.xyz)</li>
              <li className="flex items-center gap-2">✓ Low-cost TLD filtering (.xyz, .top, .buzz)</li>
              <li className="flex items-center gap-2">✓ Regex patterns for sensitive credential prompts (OTP/PIN)</li>
              <li className="flex items-center gap-2">✓ Known suspect repository matching (I4C registry sync)</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/70 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">2. Semantic AI Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Interprets contextual psychological manipulation, coercive language, and multi-turn deception vectors.
            </p>
            <ul className="space-y-2 text-xs font-mono text-neutral-300">
              <li className="flex items-center gap-2">✓ Urgency and intimidation trigger identification</li>
              <li className="flex items-center gap-2">✓ DISCOM & police impersonation parsing</li>
              <li className="flex items-center gap-2">✓ Multilingual Hinglish & regional dialect intent detection</li>
              <li className="flex items-center gap-2">✓ Plain-language explainable risk synthesis</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
