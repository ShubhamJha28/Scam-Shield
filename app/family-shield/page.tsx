"use client";

import React from "react";

export default function FamilyShieldPage() {
  return (
    <section id="family-shield" className="mt-8 max-w-4xl mx-auto scroll-mt-24">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-orange-400">
          Social Cyber-Protection
        </span>
        <h2 className="font-serif text-3xl font-bold text-white">
          👨👩👧 Family Shield Dashboard
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
          Monitor and triage threat vectors received by vulnerable family members and dependents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Grandmother's Phone", relation: "Elderly Parent", status: "1 Flagged Threat Today", safe: false },
          { name: "Father's Mobile", relation: "Primary Earner", status: "Protected • 0 Alerts", safe: true },
          { name: "Daughter's Tablet", relation: "Student", status: "Protected • 0 Alerts", safe: true }
        ].map((m, i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/10 bg-[#0e0e11]/90 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">{m.relation}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  m.safe
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                }`}
              >
                {m.safe ? "🟢 Protected" : "🔴 Threat Flagged"}
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-white">{m.name}</h3>
            <p className="text-xs font-mono text-neutral-300">{m.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
