"use client";

import React, { useState, useEffect } from "react";
import { getAuditTrail } from "@/lib/api";
import {
  ScrollText,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  RotateCcw,
  Clock,
  User,
  CheckCircle,
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
      console.error(err);
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
    <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--pal-200)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            Append-Only Audit Timeline
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Cryptographically auditable timeline of prompts, models, simulation evidence, and administrative changes.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="neu-raised-sm px-3 py-1.5 rounded-xl text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] cursor-pointer"
        >
          Refresh Timeline
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          Loading audit entries...
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-[var(--pal-200)]">
          {events.map((ev) => {
            const Icon = getEventIcon(ev.action);
            const isApply = ev.action === "approve_and_apply";
            const isRollback = ev.action === "rollback_policy";

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEventForInspector && onSelectEventForInspector(ev)}
                className="relative neu-raised-sm p-4 border border-[var(--pal-200)] rounded-xl transition-all hover:neu-inset cursor-pointer"
              >
                {/* Node icon dot on timeline line */}
                <div
                  className={`absolute -left-[30px] top-4 w-6 h-6 rounded-full flex items-center justify-center border ${
                    isApply
                      ? "bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border-[var(--allow)]"
                      : isRollback
                      ? "bg-[rgba(179,38,30,0.12)] text-[var(--deny)] border-[var(--deny)]"
                      : "neu-raised-sm text-[var(--ink-700)] border-[var(--pal-200)] bg-[var(--surface-card)]"
                  }`}
                >
                  <Icon className="w-3 h-3" strokeWidth={1.75} />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isApply
                          ? "bg-[rgba(26,107,67,0.12)] text-[var(--allow)]"
                          : isRollback
                          ? "bg-[rgba(179,38,30,0.12)] text-[var(--deny)]"
                          : "neu-inset text-[var(--ink-700)]"
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--ink-900)]">
                      {ev.object_ref}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--ink-500)]">
                    <span className="flex items-center gap-1 text-[var(--ink-700)]">
                      <User className="w-3 h-3 text-[var(--ink-500)]" strokeWidth={1.75} />
                      {ev.actor}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--ink-500)]" strokeWidth={1.75} />
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Event payload details */}
                <div className="mt-2 text-xs text-[var(--ink-600)] font-sans">
                  {ev.payload.prompt && (
                    <span className="italic">"{ev.payload.prompt}" </span>
                  )}
                  {ev.payload.passed !== undefined && (
                    <span className="text-[var(--allow)] font-mono block mt-1">
                      Evidence proven: {ev.payload.passed}/{ev.payload.total} probes passed
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
