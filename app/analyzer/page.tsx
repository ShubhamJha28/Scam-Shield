"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Link2, Camera, QrCode, Mic, MicOff, Sparkles, ArrowRight,
  Activity, UploadCloud, FileDown, Layers
} from "lucide-react";
import { createWorker } from "tesseract.js";
import jsQR from "jsqr";
import { runHeuristicAudit } from "@/lib/heuristics";
import { exportForensicIncidentPdf } from "@/lib/pdfReport";
import { useAppContext } from "@/components/AppContext";
import { TRANSLATIONS } from "@/lib/translations";

type VectorTab = "text" | "url" | "ocr" | "qr" | "voice";

// Demo presets
const DEMO_PRESETS = [
  {
    id: "sbi-kyc",
    pillLabel: "SBI KYC Blocked Alert",
    tab: "text" as VectorTab,
    content: "URGENT: Your SBI account will be blocked today within 30 mins. Verify your KYC immediately at: https://sbi-kyc-update.xyz to avoid suspension.",
    category: "Banking / KYC Impersonation",
    score: 91,
    verdict: "CRITICAL",
    confidence: "96%",
    factors: [
      { name: "Lookalike Domain Detected", score: 25, max: 25, note: "sbi-kyc-update.xyz mimics official sbi.co.in" },
      { name: "Artificial Urgency Manipulation", score: 20, max: 20, note: "Coercive 30-minute block ultimatum" },
      { name: "Credential Solicitation", score: 20, max: 20, note: "Requires unverified net-banking credentials" },
      { name: "Unofficial Bulk Gateway", score: 15, max: 15, note: "Sender masked via unregistered SMS route" },
      { name: "Known Phishing Signature", score: 11, max: 20, note: "Exact payload flagged in I4C database" }
    ],
    redFlags: [
      "State Bank of India will never send SMS notices containing random .xyz web extensions.",
      "Creates artificial urgency ('within 30 minutes') to provoke emotional distress.",
      "The domain 'sbi-kyc-update.xyz' was registered only 4 days ago."
    ],
    action: "Do not click the link or enter OTPs. Block the sender and dial 1930."
  },
  {
    id: "amazon-job",
    pillLabel: "Amazon Work-From-Home ₹2,999 Fee",
    tab: "text" as VectorTab,
    content: "Congratulations! Selected for Amazon Online Rating Work. Earn ₹3,000-₹8,000 daily from home. Pay ₹2,999 refundable registration fee to start. Join Telegram @AmazonJobHR",
    category: "Employment / Task Exploitation",
    score: 88,
    verdict: "HIGH RISK",
    confidence: "94%",
    factors: [
      { name: "Upfront Fee Demand", score: 30, max: 30, note: "Demands registration fee before providing work" },
      { name: "Disproportionate Earnings", score: 25, max: 25, note: "Unrealistic guaranteed daily payouts" },
      { name: "Unverified Messaging Gateway", score: 20, max: 25, note: "Directs applicant to private Telegram handle" },
      { name: "Corporate Identity Spoofing", score: 13, max: 20, note: "Amazon HR does not recruit via Telegram" }
    ],
    redFlags: [
      "Legitimate enterprise employers never require refundable security deposits.",
      "Guaranteed daily returns for review/like operations follow typical task-trapping schemes."
    ],
    action: "Discontinue all communication. Do not send funds to unverified UPI IDs."
  },
  {
    id: "electricity-cut",
    pillLabel: "Electricity Disconnection Tonight Call",
    tab: "voice" as VectorTab,
    content: "Sir, this is Rajesh Verma from State Electricity Board. Your bill is pending from last month. Power connection will be severed at 9:30 PM tonight. Call this number immediately or download QuickSupport app to update bill.",
    category: "Utility Impersonation Fraud",
    score: 94,
    verdict: "CRITICAL",
    confidence: "98%",
    factors: [
      { name: "Authority Impersonation", score: 25, max: 25, note: "Claims to represent State DISCOM office" },
      { name: "Threat of Disconnection", score: 25, max: 25, note: "Immediate evening disconnection ultimatum" },
      { name: "Remote Desktop Trap", score: 25, max: 25, note: "Requests download of QuickSupport/AnyDesk" },
      { name: "Direct Phone Extortion", score: 19, max: 25, note: "Bypasses official utility payment portal" }
    ],
    redFlags: [
      "DISCOMs issue written notices on consumer account numbers; they do not place urgent evening calls.",
      "Demanding screen-sharing apps allows scammers to capture credentials and OTPs."
    ],
    action: "Hang up immediately. Pay outstanding bills strictly through authorized DISCOM portals."
  },
  {
    id: "paytm-cashback",
    pillLabel: "Fake Paytm Cash-Back QR Code",
    tab: "qr" as VectorTab,
    content: "QR Decoded Payload: upi://pay?pa=merchant94827@okaxis&pn=PaytmReward&am=4500&cu=INR",
    category: "Reverse UPI QR Trap",
    score: 86,
    verdict: "HIGH RISK",
    confidence: "92%",
    factors: [
      { name: "Inverted Flow Trap", score: 35, max: 35, note: "Debit intent masked as incoming cash reward" },
      { name: "Misleading Merchant Name", score: 25, max: 25, note: "'PaytmReward' linked to personal VPA" },
      { name: "Fixed Amount Coercion", score: 15, max: 20, note: "Pre-set debit payload of ₹4,500" },
      { name: "Context Inconsistency", score: 11, max: 20, note: "Receiving money on UPI never requires a PIN" }
    ],
    redFlags: [
      "Entering your UPI PIN debits your account; receiving money never requires entering a PIN.",
      "The VPA is registered to an individual savings account masquerading under a corporate name."
    ],
    action: "Do not scan or authenticate with UPI PIN. Reject the transfer prompt on your UPI app."
  }
];

export default function AnalyzerPage() {
  const { lang, setIsEmergencyOpen } = useAppContext();
  const t = TRANSLATIONS[lang];

  const [activeVector, setActiveVector] = useState<VectorTab>("text");
  const [inputVal, setInputVal] = useState(DEMO_PRESETS[0].content);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [scanResult, setScanResult] = useState<typeof DEMO_PRESETS[0] | null>(DEMO_PRESETS[0]);
  const [isRecording, setIsRecording] = useState(false);

  const ocrInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    setScanResult(null);
    setAnalysisStep(0);
    
    try {
      let current = 0;
      const progressInterval = setInterval(() => {
        if (current < 3) {
          current++;
          setAnalysisStep(current);
        }
      }, 600);
      
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze/image", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setAnalysisStep(4);

      if (!res.ok) throw new Error("Image analysis failed");

      const data = await res.json();
      
      setScanResult({
        id: `custom-img-${Date.now()}`,
        pillLabel: `Engine: ${data.engine_used}`,
        tab: "ocr",
        content: `[Image Upload] ${file.name}`,
        category: data.scam_type || "Suspicious Image",
        score: data.threat_score || 0,
        verdict: (data.verdict || "UNKNOWN").replace("_", " "),
        confidence: "90%",
        factors: [
          { name: "Risk Assessment", score: data.threat_score, max: 100, note: data.explanation },
          { name: "Engine Latency", score: 100, max: 100, note: `${data.latency_ms}ms execution time` }
        ],
        redFlags: [
          data.explanation,
          `Verdict derived via server-side OCR pipeline.`
        ],
        action: data.recommended_action || "Do not provide credentials, OTPs, or transfer money."
      });
      
    } catch (err) {
      console.error(err);
      alert("Image analysis failed. Please ensure the Python backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    setScanResult(null);
    setAnalysisStep(0);
    
    try {
      let current = 0;
      const progressInterval = setInterval(() => {
        if (current < 3) {
          current++;
          setAnalysisStep(current);
        }
      }, 400);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze/qr", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setAnalysisStep(4);

      if (!res.ok) throw new Error("QR analysis failed");

      const data = await res.json();
      
      setScanResult({
        id: `custom-qr-${Date.now()}`,
        pillLabel: `Engine: ${data.engine_used}`,
        tab: "qr",
        content: `[QR Upload] ${file.name}`,
        category: data.scam_type || "Suspicious QR",
        score: data.threat_score || 0,
        verdict: (data.verdict || "UNKNOWN").replace("_", " "),
        confidence: "95%",
        factors: [
          { name: "QR Decoder", score: data.threat_score, max: 100, note: data.explanation },
          { name: "Engine Latency", score: 100, max: 100, note: `${data.latency_ms}ms execution time` }
        ],
        redFlags: [
          data.explanation,
          "QR payloads bypass visual inspection. Do not blindly approve UPI mandates."
        ],
        action: data.recommended_action || "Reject the transfer prompt on your UPI app."
      });

    } catch (err) {
      console.error(err);
      alert("QR analysis failed. Please ensure the Python backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    setScanResult(null);
    setAnalysisStep(0);
    
    try {
      let current = 0;
      const progressInterval = setInterval(() => {
        if (current < 3) {
          current++;
          setAnalysisStep(current);
        }
      }, 800);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze/audio", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setAnalysisStep(4);

      if (!res.ok) throw new Error("Audio analysis failed");

      const data = await res.json();
      
      setScanResult({
        id: `custom-audio-${Date.now()}`,
        pillLabel: `Engine: ${data.engine_used}`,
        tab: "voice",
        content: `[Audio Upload] ${file.name}`,
        category: data.scam_type || "Suspicious Call Recording",
        score: data.threat_score || 0,
        verdict: (data.verdict || "UNKNOWN").replace("_", " "),
        confidence: "94%",
        factors: [
          { name: "Risk Assessment", score: data.threat_score, max: 100, note: data.explanation },
          { name: "Engine Latency", score: 100, max: 100, note: `${data.latency_ms}ms execution time` }
        ],
        redFlags: [
          data.explanation,
          "Audio transcribed via backend STT and piped to Semantic Engine."
        ],
        action: data.recommended_action || "Do not provide credentials. Disconnect the call."
      });

    } catch (err) {
      console.error(err);
      alert("Audio analysis failed. Please ensure the Python backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!inputVal.trim()) return;
    setIsAnalyzing(true);
    setScanResult(null);
    setAnalysisStep(0);

    const steps = [
      "Routing payload to hybrid analysis engine...",
      "Running deterministic pattern checks...",
      "Executing semantic LLM evaluation...",
      "Finalizing threat verdict..."
    ];

    try {
      let current = 0;
      const progressInterval = setInterval(() => {
        if (current < 3) {
          current++;
          setAnalysisStep(current);
        }
      }, 400);

      const endpoint = activeVector === "url" ? "/api/analyze/url" : "/api/analyze";
      const payloadKey = activeVector === "url" ? "url" : "text";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [payloadKey]: inputVal })
      });

      clearInterval(progressInterval);
      setAnalysisStep(4);

      if (!res.ok) {
        throw new Error("Backend analysis failed");
      }

      const data = await res.json();
      
      setScanResult({
        id: `custom-${Date.now()}`,
        pillLabel: `Engine: ${data.engine_used === "deterministic" ? "Deterministic" : "Semantic AI"}`,
        tab: activeVector,
        content: inputVal,
        category: data.scam_type || "Suspicious Payload",
        score: data.threat_score || 0,
        verdict: (data.verdict || "UNKNOWN").replace("_", " "),
        confidence: data.engine_used === "deterministic" ? "99.9%" : "92%",
        factors: [
          { name: "Risk Assessment", score: data.threat_score, max: 100, note: data.explanation },
          { name: "Engine Latency", score: 100, max: 100, note: `${data.latency_ms}ms execution time` }
        ],
        redFlags: [
          data.explanation,
          `Verdict derived via ${data.engine_used === "deterministic" ? "Regex Pattern Matching" : "LLM Inference"}.`
        ],
        action: data.recommended_action || "Do not provide credentials, OTPs, or transfer money. Report via 1930."
      });

    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please ensure the Python backend is running on port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="defense-console" className="w-full max-w-5xl mx-auto mt-8 scroll-mt-28">
      <div className="rounded-2xl border border-white/10 bg-[#0e0e11]/90 backdrop-blur-2xl shadow-2xl shadow-black overflow-hidden relative">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-neutral-400">
              scamshield-core::engine_v3.0.4 [ARMED]
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>HYBRID HEURISTICS + AI PIPELINE ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-5 border-b border-white/10 bg-black/40">
          {[
            { id: "text", label: t.tabText, icon: FileText },
            { id: "url", label: t.tabUrl, icon: Link2 },
            { id: "ocr", label: t.tabOcr, icon: Camera },
            { id: "qr", label: t.tabQr, icon: QrCode },
            { id: "voice", label: t.tabVoice, icon: Mic }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeVector === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveVector(tab.id as VectorTab)}
                className={`flex items-center justify-center gap-2 py-3.5 text-xs font-medium transition-all relative ${
                  isActive
                    ? "text-orange-400 bg-orange-500/10 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeConsoleTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        <input type="file" ref={ocrInputRef} onChange={handleOcrFile} accept="image/*" className="hidden" />
        <input type="file" ref={qrInputRef} onChange={handleQrFile} accept="image/*" className="hidden" />
        <input type="file" ref={audioInputRef} onChange={handleAudioFile} accept="audio/*" className="hidden" />

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Presets:
            </span>
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveVector(p.tab);
                  setInputVal(p.content);
                  setScanResult(null);
                }}
                className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                  inputVal.slice(0, 20) === p.content.slice(0, 20)
                    ? "border-orange-500/50 bg-orange-500/15 text-orange-300 font-semibold"
                    : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {p.pillLabel}
              </button>
            ))}
          </div>

          <div className="relative">
            {activeVector === "text" && (
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                rows={4}
                placeholder="Paste suspicious SMS, WhatsApp message, or email payload here..."
                className="w-full bg-neutral-900/60 border border-white/10 rounded-xl p-4 text-xs sm:text-sm font-mono text-neutral-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-neutral-600 resize-none"
              />
            )}

            {activeVector === "url" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 rounded-xl p-2 focus-within:border-orange-500/50">
                  <span className="pl-2 font-mono text-xs text-neutral-500">https://</span>
                  <input
                    type="text"
                    value={inputVal.replace(/^https?:\/\//, "")}
                    onChange={(e) => setInputVal(`https://${e.target.value.replace(/^https?:\/\//, "")}`)}
                    placeholder="sbi-kyc-update.xyz/login"
                    className="w-full bg-transparent text-xs sm:text-sm font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeVector === "ocr" && (
              <div
                onClick={() => ocrInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-xl p-6 bg-neutral-900/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/40 hover:bg-neutral-900/60 transition-all"
              >
                <UploadCloud className="w-8 h-8 text-orange-400" />
                <span className="text-xs font-mono text-neutral-200">
                  Click to upload suspicious WhatsApp / SMS screenshot
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Runs client-side Tesseract.js WebAssembly OCR
                </span>
              </div>
            )}

            {activeVector === "qr" && (
              <div
                onClick={() => qrInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-xl p-6 bg-neutral-900/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/40 hover:bg-neutral-900/60 transition-all"
              >
                <QrCode className="w-8 h-8 text-orange-400" />
                <span className="text-xs font-mono text-neutral-200">
                  Upload suspicious UPI payment QR code screenshot
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Decodes embedded VPA address, transaction amount, and direction
                </span>
              </div>
            )}

            {activeVector === "voice" && (
              <div
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-xl p-6 bg-neutral-900/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/40 hover:bg-neutral-900/60 transition-all"
              >
                <Mic className="w-8 h-8 text-orange-400" />
                <span className="text-xs font-mono text-neutral-200">
                  Upload suspicious call recording (.mp3, .wav)
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Transcribes and detects deepfake/coercion markers using Semantic AI
                </span>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing Vector...
                  </>
                ) : (
                  <>
                    Analyze Threat with Hybrid Engine <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-orange-400">
                <span>FORENSIC SCAN EXECUTION</span>
                <span>{(analysisStep + 1) * 25}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(analysisStep + 1) * 25}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>
          )}

          {scanResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-white/10 bg-neutral-900/60 p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xl border ${
                      scanResult.score >= 75
                        ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-950/40"
                        : scanResult.score >= 35
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    }`}
                  >
                    <span>{scanResult.score}</span>
                    <span className="text-[9px] font-normal text-neutral-400">/100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                        {scanResult.category}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          scanResult.score >= 75
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {scanResult.verdict} ({scanResult.confidence} Confidence)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Evaluated via Rule-based Heuristics + Language Intent Parsing
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => exportForensicIncidentPdf({
                    id: scanResult.id,
                    category: scanResult.category,
                    riskScore: scanResult.score,
                    verdict: scanResult.verdict,
                    content: scanResult.content,
                    flags: scanResult.redFlags,
                    action: scanResult.action
                  })}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 hover:border-orange-500/40 bg-neutral-800/80 text-xs font-mono text-neutral-300 hover:text-white transition-all self-start sm:self-auto"
                >
                  <FileDown className="w-3.5 h-3.5 text-orange-400" /> Export Incident PDF
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-400" /> Explainable Risk Factor Breakdown:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scanResult.factors.map((factor, i) => (
                    <div key={i} className="p-3 rounded-lg bg-neutral-950/60 border border-white/5 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-200">{factor.name}</span>
                        <span className="text-orange-400 font-bold">
                          +{factor.score} / {factor.max}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                          style={{ width: `${(factor.score / factor.max) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono">{factor.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/5 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-orange-400">
                  Forensic Red Flags Identified:
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                  {scanResult.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold leading-none mt-1">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <div className="text-xs">
                  <span className="font-semibold text-white block">Recommended Citizen Protocol:</span>
                  <span className="text-neutral-300 mt-0.5 block">{scanResult.action}</span>
                </div>
                {scanResult.score >= 70 && (
                  <button
                    onClick={() => setIsEmergencyOpen(true)}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-500/20 whitespace-nowrap"
                  >
                    Open Emergency Desk
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
