import React from "react";
import { MessageSquareShare } from "lucide-react";

export function BotBanner() {
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in hidden sm:flex">
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-3 bg-neutral-900 border border-emerald-500/30 hover:border-emerald-500 p-2 pr-4 rounded-full shadow-2xl shadow-emerald-900/20 transition-all duration-300 hover:scale-105"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
          <MessageSquareShare className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">Verify via WhatsApp</span>
          <span className="text-[10px] text-neutral-400 font-sans">Forward suspicious SMS/Links directly</span>
        </div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/0 group-hover:animate-ping opacity-20 pointer-events-none" />
      </a>
    </div>
  );
}
