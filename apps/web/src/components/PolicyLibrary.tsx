"use client";

import React, { useState, useEffect } from "react";
import { listPolicies, rollbackPolicy } from "@/lib/api";
import { Shield, RotateCcw, Eye, Clock, CheckCircle2, AlertOctagon, Layers } from "lucide-react";

interface PolicyLibraryProps {
  onSelectPolicy: (policy: any) => void;
}

export function PolicyLibrary({ onSelectPolicy }: PolicyLibraryProps) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      const data = await listPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleRollback = async (policyId: string) => {
    setRollingBack(policyId);
    try {
      await rollbackPolicy(policyId, "admin-dashboard");
      await fetchPolicies();
    } catch (err) {
      alert("Rollback failed: " + err);
    } finally {
      setRollingBack(null);
    }
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Policy Library & Version Control
          </h3>
          <p className="text-xs text-slate-400">
            Immutable versioned policies with one-click instant rollback capability.
          </p>
        </div>
        <button
          onClick={fetchPolicies}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading policies...</div>
      ) : policies.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs font-mono">
          No policies recorded in database. Compile your first intent from the Command Center!
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((pol) => {
            const isApplied = pol.status === "applied";
            const isRolledBack = pol.status === "rolled_back";
            const isSimulated = pol.status === "simulated";

            return (
              <div
                key={pol.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100">{pol.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isApplied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isRolledBack
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : isSimulated
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {pol.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">ID: {pol.id}</span>
                  </div>

                  {pol.active_version && (
                    <p className="text-xs text-slate-300 font-mono truncate max-w-xl">
                      "{pol.active_version.prompt}"
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Updated: {new Date(pol.updated_at).toLocaleTimeString()}
                    </span>
                    <span>Versions: {pol.versions_count}</span>
                    {pol.active_version && (
                      <span>Risk: {pol.active_version.risk_score}/100</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPolicy(pol)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  {isApplied && (
                    <button
                      onClick={() => handleRollback(pol.id)}
                      disabled={rollingBack === pol.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{rollingBack === pol.id ? "Rolling back..." : "Roll Back"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
