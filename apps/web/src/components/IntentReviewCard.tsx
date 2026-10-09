"use client";

import React from "react";
import { FirewallIntentIR, ValidationReport } from "@/lib/api";
import {
  Ban,
  ShieldCheck,
  ShieldAlert,
  Play,
  Wifi,
  Globe,
  Workflow,
  ArrowRight,
  TriangleAlert,
  Lock,
  CircleCheck,
  CircleX,
  Clock,
  Activity,
} from "lucide-react";

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
    <div className="neu-raised-md p-6 border border-[var(--pal-200)] relative">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--pal-200)] gap-3">
        <div className="flex items-center gap-3">
          {/* Action Badge */}
          <div
            className={`px-3 py-1 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-1.5 ${
              ir.action === "deny"
                ? "bg-[rgba(179,38,30,0.12)] text-[var(--deny)] border border-[rgba(179,38,30,0.3)]"
                : ir.action === "isolate"
                ? "bg-[rgba(138,90,0,0.12)] text-[var(--warn)] border border-[rgba(138,90,0,0.3)]"
                : ir.action === "rate-limit"
                ? "bg-[rgba(47,93,158,0.12)] text-[var(--info)] border border-[rgba(47,93,158,0.3)]"
                : "bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border border-[rgba(26,107,67,0.3)]"
            }`}
          >
            {isDenied ? <Ban className="w-3.5 h-3.5" strokeWidth={1.75} /> : <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />}
            <span>Action: {ir.action}</span>
          </div>

          <span className="text-sm font-semibold text-[var(--ink-900)]">
            Intermediate Representation (IR)
          </span>
          <span className="text-[11px] font-mono text-[var(--ink-500)] px-2 py-0.5 rounded neu-inset">
            {ir.intent_id}
          </span>
        </div>

        {/* Risk Score & Model */}
        <div className="flex items-center gap-2">
          {/* 3-Segment Risk Meter */}
          <div className="flex items-center gap-2 neu-inset px-2.5 py-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-[var(--ink-500)]">Risk:</span>
            <div className="flex items-center gap-1">
              <span
                className={`w-3 h-2 rounded-xs ${
                  validation.risk_level === "low" ? "bg-[var(--allow)]" : "bg-[var(--pal-300)]"
                }`}
              />
              <span
                className={`w-3 h-2 rounded-xs ${
                  validation.risk_level === "medium" ? "bg-[var(--warn)]" : "bg-[var(--pal-300)]"
                }`}
              />
              <span
                className={`w-3 h-2 rounded-xs ${
                  validation.risk_level === "high" || validation.risk_level === "critical"
                    ? "bg-[var(--deny)]"
                    : "bg-[var(--pal-300)]"
                }`}
              />
            </div>
            <span
              className={`font-mono text-[11px] font-bold uppercase ${
                validation.risk_level === "low"
                  ? "text-[var(--allow)]"
                  : validation.risk_level === "medium"
                  ? "text-[var(--warn)]"
                  : "text-[var(--deny)]"
              }`}
            >
              {validation.risk_level} ({validation.risk_score}/100)
            </span>
          </div>

          <div className="text-[11px] font-mono text-[var(--ink-600)] neu-raised-sm px-2 py-1">
            {providerUsed}
          </div>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="my-4 p-4 rounded-xl neu-inset font-sans">
        <p className="text-sm text-[var(--ink-900)] leading-relaxed font-medium">
          "{ir.explanation}"
        </p>

        {/* Confidence Progress & Metadata */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--ink-500)] pt-2 border-t border-[var(--pal-200)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]">Confidence:</span>
            <div className="w-24 h-2 neu-inset overflow-hidden">
              <div
                className="h-full bg-[var(--ink-700)] rounded-full"
                style={{ width: `${Math.round(ir.confidence * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-[var(--ink-700)]">
              {Math.round(ir.confidence * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Direction: {ir.direction}</span>
            <span>Logging: {ir.log ? "Enabled" : "Off"}</span>
          </div>
        </div>
      </div>

      {/* Labeled Inset Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Source Entity */}
        <div className="p-3 rounded-xl neu-raised-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] flex items-center gap-1 mb-1">
            <Wifi className="w-3 h-3 text-[var(--ink-500)]" strokeWidth={1.75} />
            Source Entity
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded neu-inset text-[var(--ink-600)]">
              {ir.source.type}
            </span>
            <span className="text-sm font-bold text-[var(--ink-900)]">{ir.source.ref}</span>
          </div>
          {ir.source.cidr && (
            <span className="text-[11px] font-mono text-[var(--ink-500)] block mt-1">
              {ir.source.cidr}
            </span>
          )}
        </div>

        {/* Destination Target */}
        <div className="p-3 rounded-xl neu-raised-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] flex items-center gap-1 mb-1">
            <Globe className="w-3 h-3 text-[var(--ink-500)]" strokeWidth={1.75} />
            Destination Target
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded neu-inset text-[var(--ink-600)]">
              {ir.destination.type}
            </span>
            <span className="text-sm font-bold text-[var(--ink-900)]">{ir.destination.ref}</span>
          </div>
          {ir.destination.cidr && (
            <span className="text-[11px] font-mono text-[var(--ink-500)] block mt-1">
              {ir.destination.cidr}
            </span>
          )}
        </div>

        {/* Protocols & Ports */}
        <div className="p-3 rounded-xl neu-raised-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] flex items-center gap-1 mb-1">
            <Workflow className="w-3 h-3 text-[var(--ink-500)]" strokeWidth={1.75} />
            Protocols & Ports
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {ir.protocols && ir.protocols.length > 0 ? (
              ir.protocols.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded neu-inset font-mono text-[11px] text-[var(--ink-700)]"
                >
                  {p.proto.toUpperCase()} {p.port ? `:${p.port}` : ""}
                </span>
              ))
            ) : (
              <span className="text-xs font-mono text-[var(--ink-500)]">Default (All/Service Ports)</span>
            )}
            {ir.rate_limit && (
              <span className="px-2 py-0.5 rounded neu-inset font-mono text-[11px] text-[var(--info)]">
                {ir.rate_limit.rate}/{ir.rate_limit.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Invariant Status Bar */}
      <div className="p-3.5 rounded-xl neu-inset text-xs mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--ink-900)]">Blast Radius:</span>
            <span className="text-[var(--ink-600)]">
              Zones: {validation.blast_radius.affected_zones.join(", ") || ir.source.ref}
            </span>
            <span className="text-[var(--ink-400)]">•</span>
            <span className="text-[var(--ink-600)]">
              Estimated Hosts: ~{validation.blast_radius.estimated_hosts}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium font-mono">
            {validation.lockout_safe ? (
              <span className="text-[var(--allow)] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
                Management Invariants Intact
              </span>
            ) : (
              <span className="text-[var(--deny)] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.75} />
                Lockout Guard Triggered: Refused
              </span>
            )}
          </div>
        </div>

        {/* Validation Issues / Suggestions */}
        {validation.issues.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--pal-200)] space-y-1.5">
            {validation.issues.map((iss, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs flex items-start gap-2 ${
                  iss.severity === "critical"
                    ? "bg-[rgba(179,38,30,0.12)] text-[var(--deny)] border border-[rgba(179,38,30,0.3)] font-semibold"
                    : "bg-[rgba(138,90,0,0.12)] text-[var(--warn)] border border-[rgba(138,90,0,0.3)]"
                }`}
              >
                <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <span className="font-bold">{iss.code}:</span> {iss.message}
                  {iss.suggested_fix && (
                    <span className="block opacity-90 mt-0.5 text-[11px] font-mono">
                      Suggested Fix: {iss.suggested_fix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ambiguity notes */}
      {ir.ambiguities && ir.ambiguities.length > 0 && (
        <div className="mb-4 p-2.5 rounded-lg neu-inset text-[11px] text-[var(--ink-600)] flex items-start gap-2">
          <TriangleAlert className="w-3.5 h-3.5 text-[var(--warn)] shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <span className="font-semibold text-[var(--ink-700)]">Compiler Note: </span>
            {ir.ambiguities.join(" ")}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[var(--ink-500)]">
          Validate on emulated topology before applying.
        </span>

        <button
          onClick={onSimulate}
          disabled={isSimulating || !validation.lockout_safe}
          aria-label="Simulate policy in sandbox"
          className={`btn-graphite-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
            !validation.lockout_safe ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isSimulating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Simulating Probes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" strokeWidth={2} />
              <span>Simulate Policy in Sandbox</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
