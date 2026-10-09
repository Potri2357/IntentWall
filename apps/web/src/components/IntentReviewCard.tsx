"use client";

import React from "react";
import { FirewallIntentIR, ValidationReport } from "@/lib/api";
import { Shield, PlayCircle, AlertTriangle, CheckCircle, Info, Zap, AlertOctagon } from "lucide-react";

interface IntentReviewCardProps {
  ir: FirewallIntentIR;
  validation: ValidationReport;
  providerUsed: string;
  onSimulate: () => void;
  isSimulating: boolean;
}

export function IntentReviewCard({
  ir,
  validation,
  providerUsed,
  onSimulate,
  isSimulating,
}: IntentReviewCardProps) {
  const isDenied = ir.action === "deny" || ir.action === "isolate";

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-700/60 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-xl font-bold uppercase text-xs tracking-wider border ${
              ir.action === "deny"
                ? "bg-red-500/20 text-red-300 border-red-500/40"
                : ir.action === "isolate"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : ir.action === "rate-limit"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            ACTION: {ir.action}
          </div>
          <span className="text-sm font-semibold text-slate-100">Parsed Intermediate Representation (IR)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {ir.intent_id}
          </span>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              validation.risk_level === "critical"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : validation.risk_level === "high"
                ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                : validation.risk_level === "medium"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {validation.risk_level === "critical" ? (
              <AlertOctagon className="w-3.5 h-3.5" />
            ) : validation.risk_level === "low" ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>Risk Score: {validation.risk_score}/100 ({validation.risk_level.toUpperCase()})</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            Model: {providerUsed}
          </div>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="my-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
          "{ir.explanation}"
        </p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Confidence:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.round(ir.confidence * 100)}%` }}
              />
            </div>
            <span className="font-mono text-slate-300">{Math.round(ir.confidence * 100)}%</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>Direction: {ir.direction}</span>
            <span>•</span>
            <span>Logging: {ir.log ? "Enabled" : "Off"}</span>
          </div>
        </div>
      </div>

      {/* Structured IR Entities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Source */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Source Entity</span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {ir.source.type}
            </span>
            <span className="text-sm font-bold text-slate-100">{ir.source.ref}</span>
          </div>
          {ir.source.cidr && (
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">{ir.source.cidr}</span>
          )}
        </div>

        {/* Destination */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Destination Target</span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              {ir.destination.type}
            </span>
            <span className="text-sm font-bold text-slate-100">{ir.destination.ref}</span>
          </div>
          {ir.destination.cidr && (
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">{ir.destination.cidr}</span>
          )}
        </div>

        {/* Protocols & Ports */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Protocols & Ports</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {ir.protocols && ir.protocols.length > 0 ? (
              ir.protocols.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-200 border border-slate-700/60"
                >
                  {p.proto.toUpperCase()} {p.port ? `:${p.port}` : ""}
                </span>
              ))
            ) : (
              <span className="text-xs font-mono text-slate-400">Default (All/Service Ports)</span>
            )}
            {ir.rate_limit && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-900/40 text-cyan-200 border border-cyan-700">
                Limit: {ir.rate_limit.rate}/{ir.rate_limit.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Blast Radius Details */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Blast Radius Assessment:</span>
            <span className="text-slate-400">
              Zones: {validation.blast_radius.affected_zones.join(", ") || ir.source.ref}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">
              Estimated Hosts: ~{validation.blast_radius.estimated_hosts}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold">
            {validation.lockout_safe ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Management Plane Protected
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 animate-bounce">
                <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL: Lockout Guard Triggered
              </span>
            )}
          </div>
        </div>

        {/* Validation Issues & Warnings */}
        {validation.issues.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1">
            {validation.issues.map((iss, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-1.5 rounded ${
                  iss.severity === "critical"
                    ? "bg-rose-950/60 text-rose-200 border border-rose-800/40"
                    : iss.severity === "error"
                    ? "bg-red-950/40 text-red-200"
                    : "bg-amber-950/40 text-amber-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">{iss.code}:</span> {iss.message}
                  {iss.suggested_fix && (
                    <span className="block text-[11px] opacity-80 mt-0.5">
                      Fix: {iss.suggested_fix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ambiguity notes if any */}
      {ir.ambiguities && ir.ambiguities.length > 0 && (
        <div className="mb-4 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Compiler Note: </span>
            {ir.ambiguities.join(" ")}
          </div>
        </div>
      )}

      {/* Action Footer: Simulate Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400">
          Ready to verify rule semantics before deployment.
        </span>

        <button
          onClick={onSimulate}
          disabled={isSimulating || !validation.lockout_safe}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all cursor-pointer ${
            !validation.lockout_safe
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30"
          }`}
        >
          {isSimulating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Simulating Probes on Live Topology...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Simulate & Prove Policy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
