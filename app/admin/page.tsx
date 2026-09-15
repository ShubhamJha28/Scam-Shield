"use client";

import { useState, useEffect } from "react";
import { BarChart3, Activity, ShieldAlert, IndianRupee, Server, Database, Brain } from "lucide-react";

type AdminStats = {
  total_scans: number;
  total_threats_intercepted: number;
  total_incidents_reported: number;
  total_money_lost_inr: number;
  top_scam_types: { type: string, count: number }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black -z-10" />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-neutral-400" />
            System Analytics
          </h1>
          <p className="text-neutral-400 mt-2 font-mono text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Metrics from ScamShield Backend
          </p>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <Server className="w-8 h-8 animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-400 text-sm font-medium">Total Scans Executed</span>
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">{stats.total_scans.toLocaleString()}</div>
              </div>
              
              <div className="bg-neutral-900/50 border border-red-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldAlert className="w-16 h-16 text-red-500" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-neutral-400 text-sm font-medium">Threats Intercepted</span>
                </div>
                <div className="text-3xl font-bold font-mono text-red-400 relative z-10">{stats.total_threats_intercepted.toLocaleString()}</div>
                <div className="text-xs text-red-500/70 mt-1 relative z-10">HIGH & CRITICAL RISK</div>
              </div>
              
              <div className="bg-neutral-900/50 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-400 text-sm font-medium">1930 Reports Filed</span>
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-orange-400">{stats.total_incidents_reported.toLocaleString()}</div>
              </div>
              
              <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-400 text-sm font-medium">Recorded Financial Loss</span>
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-400">₹{stats.total_money_lost_inr.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" /> Most Prevalent Vectors
                </h3>
                <div className="space-y-4">
                  {stats.top_scam_types.length === 0 ? (
                     <p className="text-neutral-500 text-sm italic">No threat vectors identified yet.</p>
                  ) : (
                    stats.top_scam_types.map((scam, i) => (
                      <div key={i} className="flex flex-col">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-neutral-300 font-medium">{scam.type}</span>
                          <span className="font-mono text-neutral-500">{scam.count}</span>
                        </div>
                        <div className="w-full bg-black rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((scam.count / (stats.total_threats_intercepted || 1)) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                 <ShieldAlert className="w-16 h-16 text-neutral-800 mb-4" />
                 <h3 className="text-xl font-bold text-neutral-500 mb-2">ScamShield Defensibility</h3>
                 <p className="text-neutral-600 max-w-sm text-sm">
                   The hybrid deterministic and semantic LLM engine is actively processing traffic and preventing financial fraud across Bharat.
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-center py-20">Failed to load admin stats. Is the Python backend running?</div>
        )}
      </div>
    </main>
  );
}
