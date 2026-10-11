"use client";

import React, { useState, useEffect } from "react";
import { getAuditTrail } from "@/lib/api";
import {
  ScrollText,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  FileCode,
} from "lucide-react";

interface AuditTrailProps {
  onSelectEventForInspector?: (event: any) => void;
}

export function AuditTrail({ onSelectEventForInspector }: AuditTrailProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      const data = await getAuditTrail();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load audit trail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const getEventIcon = (action: string) => {
    switch (action) {
      case "parse_intent":
        return Sparkles;
      case "simulate_policy":
        return FlaskConical;
      case "approve_and_apply":
        return ShieldCheck;
      case "rollback_policy":
        return RotateCcw;
      default:
        return FileCode;
    }
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-[var(--border)] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={2} />
            Firewall Policy Audit Trail
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Append-only chronological record of security intents, probe verifications, and gateway rule changes.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-well)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:border-[var(--border-strong)] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          Loading audit logs from gateway database...
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          No audit entries recorded yet. Compile or apply a policy to generate logs.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border)]">
          {events.map((ev) => {
            const Icon = getEventIcon(ev.action);
            const isApply = ev.action === "approve_and_apply";
            const isRollback = ev.action === "rollback_policy";

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEventForInspector && onSelectEventForInspector(ev)}
                className="relative bg-[var(--surface-card)] p-4 border border-[var(--border)] rounded-xl hover:border-[var(--border-strong)] hover:bg-[var(--surface-well)] transition-colors cursor-pointer shadow-xs"
              >
                {/* Node icon dot on timeline line */}
                <div
                  className={`absolute -left-[30px] top-4 w-5 h-5 rounded flex items-center justify-center border text-[10px] ${
                    isApply
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                      : isRollback
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                      : "bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)]"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--ink-900)] uppercase tracking-wider">
                      {ev.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--ink-500)] px-1.5 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)]">
                      {ev.actor}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--ink-400)]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {ev.details?.prompt && (
                  <p className="text-xs text-[var(--ink-700)] mt-1.5 font-sans">
                    "{ev.details.prompt}"
                  </p>
                )}

                <div className="mt-2 text-[10px] font-mono text-[var(--ink-400)] flex items-center gap-3">
                  <span>Policy ID: {ev.policy_id}</span>
                  {ev.details?.all_passed !== undefined && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Passed: {ev.details.passed_count}/{ev.details.total_count}
                    </span>
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
