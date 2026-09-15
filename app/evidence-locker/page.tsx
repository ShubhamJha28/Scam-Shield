"use client";

import React, { useState, useEffect } from "react";
import { FileDown, Clock, ShieldAlert } from "lucide-react";
import { exportForensicIncidentPdf } from "@/lib/pdfReport";

type IncidentReport = {
  id: number;
  victim_name: string;
  bank_name: string;
  amount_lost: number;
  utr: string;
  description: string;
  timestamp: string;
};

export default function EvidenceLockerPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/evidence");
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black -z-10" />
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-400">
            Forensic Documentation
          </span>
          <h2 className="font-serif text-3xl font-bold text-white">
            Incident Evidence Locker
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
            Live directory of all 1930 FIR drafts filed through ScamShield.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-orange-500">
            <Clock className="w-8 h-8 animate-spin" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-neutral-900/30 backdrop-blur">
            <ShieldAlert className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-300">No incident reports filed yet.</h2>
            <p className="text-neutral-500 mt-2">Reports generated via the 'I Have Already Been Scammed' wizard will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-6 rounded-2xl border border-white/10 bg-[#0e0e11]/90 backdrop-blur-xl space-y-6 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div>
                    <span className="text-xs font-mono text-neutral-400">Incident Dossier Reference</span>
                    <div className="font-mono text-base font-bold text-orange-400">#SCM-BHARAT-1930-{incident.id.toString().padStart(4, '0')}</div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-mono text-neutral-300 bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                    <div><span className="text-neutral-500">Bank:</span> {incident.bank_name}</div>
                    <div className="border-l border-white/10 pl-4 text-red-400 font-bold"><span className="text-neutral-500 font-normal">Lost:</span> ₹{incident.amount_lost.toLocaleString()}</div>
                  </div>
                  
                  <button
                    onClick={() => exportForensicIncidentPdf({
                      id: `SCM-BHARAT-1930-${incident.id.toString().padStart(4, '0')}`,
                      category: "Financial Fraud",
                      riskScore: 100,
                      verdict: "CRITICAL",
                      content: `Victim Name: ${incident.victim_name}\nBank: ${incident.bank_name}\nUTR: ${incident.utr}\n\nDescription:\n${incident.description}`,
                      flags: [
                        "Unauthorized Transfer",
                        `UTR Logged: ${incident.utr}`
                      ],
                      action: "Lodge entry on cybercrime.gov.in and request lien marker via 1930."
                    })}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileDown className="w-4 h-4" /> Export Cybercrime-Ready PDF
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" /> Incident Timeline:
                  </h4>
                  <div className="relative pl-6 border-l border-white/10 space-y-4">
                    <div className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500" />
                      <div className="text-xs font-mono text-orange-400">{new Date(incident.timestamp + "Z").toLocaleString()}</div>
                      <div className="text-xs text-neutral-200 mt-0.5">ScamShield Incident Form Submitted via 1930 Wizard.</div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-red-500/30 border border-red-500" />
                      <div className="text-xs font-mono text-red-400">Fraud Details Logged</div>
                      <div className="text-xs text-neutral-200 mt-0.5">{incident.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
