"use client";

import React, { useState, useEffect } from "react";
import { getAuditTrail } from "@/lib/api";
import { FileText, Shield, Clock, User, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";

export function AuditTrail() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      const data = await getAuditTrail();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Append-Only Audit Log
          </h3>
          <p className="text-xs text-slate-400">
            Immutable log of natural-language requests, model outputs, probe verification results, and approvals.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
        >
          Refresh Log
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading audit trail...</div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs font-mono">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const isApply = ev.action === "approve_and_apply";
            const isRollback = ev.action === "rollback_policy";
            const isSimulate = ev.action === "simulate_policy";

            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        isApply
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isRollback
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : isSimulate
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="text-slate-200 font-semibold">{ev.object_ref}</span>
                  </div>

                  <div className="text-slate-400 text-[11px] font-sans">
                    {ev.payload.prompt && (
                      <span className="italic">"{ev.payload.prompt}" </span>
                    )}
                    {ev.payload.passed !== undefined && (
                      <span className="text-emerald-400 font-mono">
                        (Passed: {ev.payload.passed}/{ev.payload.total} probes)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="w-3 h-3 text-slate-500" />
                    {ev.actor}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(ev.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
