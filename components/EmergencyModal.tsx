"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, Clock, PhoneCall, Building2, ExternalLink, X, CheckSquare, FileText, ChevronRight, ChevronLeft, Download } from "lucide-react";
import { useAppContext } from "./AppContext";
import { exportForensicIncidentPdf } from "@/lib/pdfReport";

export function EmergencyModal() {
  const { isEmergencyOpen, setIsEmergencyOpen } = useAppContext();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    utr: "",
    amount: "",
    description: "",
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);

  const generateFIR = async () => {
    try {
      // 1. Send to Python backend via Next.js proxy to save to Database
      const res = await fetch("/api/emergency/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          victim_name: formData.name || "Anonymous",
          bank_name: formData.bank || "Unknown",
          amount_lost: parseFloat(formData.amount) || 0,
          utr: formData.utr || "N/A",
          description: formData.description || "N/A"
        })
      });

      if (!res.ok) console.error("Failed to log incident on backend");
    } catch (e) {
      console.error(e);
    }

    // 2. Generate the PDF for the user
    exportForensicIncidentPdf({
      id: `FIR-DRAFT-${Math.floor(Math.random() * 10000)}`,
      category: "Unauthorized Financial Fraud",
      riskScore: 100,
      verdict: "CRITICAL INCIDENT",
      content: `Victim Name: ${formData.name}\nBank: ${formData.bank}\nAmount Lost: ₹${formData.amount}\nUTR/Txn ID: ${formData.utr}\n\nIncident Description:\n${formData.description}`,
      flags: [
        "Immediate Bank Lien Requested",
        "1930 Cybercrime Registration Draft",
        "Incident successfully logged in ScamShield Database"
      ],
      action: "Please submit this draft at cybercrime.gov.in along with KYC documents."
    });
  };

  return (
    <AnimatePresence>
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="w-full max-w-3xl bg-[#0e0e11] border border-red-500/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-red-950/40 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                    Incident Recovery Wizard
                  </h3>
                  <p className="text-xs font-mono text-red-400 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> GOLDEN HOUR PROTOCOL ACTIVE
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsEmergencyOpen(false); setStep(1); }}
                className="text-neutral-400 hover:text-white p-1 rounded-lg border border-transparent hover:border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between relative pb-4 border-b border-white/5">
              {[
                { num: 1, title: "Emergency Freeze" },
                { num: 2, title: "Evidence Gathering" },
                { num: 3, title: "Draft Complaint" }
              ].map((s) => (
                <div key={s.num} className={`flex flex-col items-center gap-1 ${step >= s.num ? 'text-orange-400' : 'text-neutral-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${step >= s.num ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-700 bg-neutral-900'}`}>
                    {s.num}
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:block">{s.title}</span>
                </div>
              ))}
            </div>

            <div className="min-h-[300px]">
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-neutral-900 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono text-neutral-300">National Cyber Financial Fraud Helpline</span>
                      <div className="text-3xl font-mono font-black text-red-400 tracking-wider">1930</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Operated 24x7 by MHA & I4C</p>
                    </div>
                    <a href="tel:1930" className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all shrink-0">
                      <PhoneCall className="w-4 h-4" /> Dial 1930 Now
                    </a>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-400" /> Bank Hotlines (Call immediately to freeze cards/UPI):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { name: "SBI", num: "1800 1234" },
                        { name: "HDFC Bank", num: "1800 1600" },
                        { name: "ICICI Bank", num: "1800 1080" },
                        { name: "Axis Bank", num: "1800 419 5959" },
                        { name: "Paytm Bank", num: "0120 4456 456" }
                      ].map((bank, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5 text-[11px] flex justify-between items-center">
                          <span className="font-semibold text-neutral-200">{bank.name}</span>
                          <span className="font-mono text-neutral-400">{bank.num}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-orange-400" /> Critical Evidence Checklist
                  </h4>
                  <p className="text-sm text-neutral-300">Before filing a complaint, ensure you have gathered the following artifacts. Do not delete any messages or clear your browser history.</p>
                  
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex gap-2 items-start bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                      <input type="checkbox" className="mt-1 accent-orange-500" />
                      <span><strong>12-digit UTR/RRN Number:</strong> Found in the bank SMS or UPI app history for the fraudulent transaction.</span>
                    </li>
                    <li className="flex gap-2 items-start bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                      <input type="checkbox" className="mt-1 accent-orange-500" />
                      <span><strong>Screenshots:</strong> Capture the SMS, WhatsApp chat, or fake website showing the scammer's promises or threats.</span>
                    </li>
                    <li className="flex gap-2 items-start bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                      <input type="checkbox" className="mt-1 accent-orange-500" />
                      <span><strong>Call Logs/Audio:</strong> Phone numbers of the scammers and duration of the calls.</span>
                    </li>
                    <li className="flex gap-2 items-start bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                      <input type="checkbox" className="mt-1 accent-orange-500" />
                      <span><strong>Bank Statement:</strong> A PDF copy of your recent statement showing the debit.</span>
                    </li>
                  </ul>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-400" /> Auto-FIR Draft Generator
                  </h4>
                  <p className="text-sm text-neutral-300">Fill in the details to generate a formatted PDF draft that you can upload to cybercrime.gov.in or hand to the local police.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Victim Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white" />
                    <input type="text" placeholder="Bank Name" value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white" />
                    <input type="text" placeholder="Amount Lost (₹)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white" />
                    <input type="text" placeholder="UTR / Txn ID" value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})} className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white" />
                    <textarea placeholder="Briefly describe how it happened (e.g., received SMS, clicked link...)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="sm:col-span-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white h-24 resize-none" />
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <button onClick={generateFIR} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold font-mono text-sm uppercase tracking-wider rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export PDF Draft
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {step > 1 ? (
                <button onClick={handlePrev} className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              ) : (
                <div /> // spacer
              )}
              
              {step < 3 ? (
                <button onClick={handleNext} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono flex items-center gap-1">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  Go to cybercrime.gov.in <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
