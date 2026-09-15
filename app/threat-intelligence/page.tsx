"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, Server, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/components/AppContext";
import { TRANSLATIONS } from "@/lib/translations";

type Threat = {
  id: number;
  payload_content: string;
  threat_score: number;
  verdict: string;
  scam_type: string;
  explanation: string;
  engine_used: string;
  timestamp: string;
};

export default function ThreatIntelligencePage() {
  const { lang } = useAppContext();
  const t = TRANSLATIONS[lang];

  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/threats");
      const data = await res.json();
      if (Array.isArray(data)) {
        setThreats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredThreats = threats.filter((threat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (threat.payload_content && threat.payload_content.toLowerCase().includes(query)) ||
      (threat.scam_type && threat.scam_type.toLowerCase().includes(query)) ||
      (threat.verdict && threat.verdict.toLowerCase().includes(query)) ||
      (threat.explanation && threat.explanation.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black -z-10" />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-orange-500" />
              {t.threatTitle}
            </h1>
            <p className="text-neutral-400 mt-2 font-mono text-sm flex items-center gap-2">
              <Server className="w-4 h-4" /> {t.threatSub}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search threat vectors, text..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500 text-white w-full md:w-64"
            />
            <button 
              onClick={fetchThreats}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm font-mono hover:bg-neutral-800 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {t.threatRefresh}
            </button>
          </div>
        </div>

        {loading && threats.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-orange-500">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-neutral-900/30 backdrop-blur">
            <AlertTriangle className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-300">No threats found.</h2>
            <p className="text-neutral-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThreats.map((threat) => (
              <div key={threat.id} className="border border-white/10 bg-neutral-900/50 backdrop-blur-sm rounded-xl p-5 hover:border-orange-500/30 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                    threat.verdict === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    threat.verdict === 'HIGH_RISK' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    threat.verdict === 'MODERATE_RISK' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {threat.verdict.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Score: <span className={threat.threat_score > 75 ? "text-red-400" : "text-amber-400"}>{threat.threat_score.toFixed(1)}/100</span>
                  </span>
                </div>
                
                <h3 className="font-semibold text-neutral-200 mb-2">{threat.scam_type}</h3>
                
                <div className="bg-black/50 rounded-lg p-3 mb-3 border border-white/5 flex-grow">
                  <p className="text-xs font-mono text-neutral-400 line-clamp-3">
                    {threat.payload_content.replace('[IMAGE OCR] ', '📸 ').replace('[QR DECODED] ', '🔗 ')}
                  </p>
                </div>
                
                <p className="text-xs text-neutral-300 mb-4 line-clamp-2">
                  <span className="text-orange-400/80 font-semibold">AI Analysis:</span> {threat.explanation}
                </p>
                
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/10 text-[10px] text-neutral-500 font-mono">
                  <span>Engine: {threat.engine_used.split(' ')[0]}</span>
                  <span>{new Date(threat.timestamp + "Z").toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
