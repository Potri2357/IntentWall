"use client";

import React, { useState } from "react";
import { ProbeResult } from "@/lib/api";
import {
  CircleCheck,
  CircleX,
  Circle,
  LoaderCircle,
  Terminal,
  ShieldCheck,
  ShieldX,
  Eye,
  Download,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Clock,
  Play,
} from "lucide-react";

interface SimulationLabProps {
  probes: ProbeResult[];
  isSimulating: boolean;
  onApprove: () => void;
  isApproving: boolean;
  appliedStatus: string;
  onViewDiff: () => void;
  onSelectProbeForInspector?: (probe: ProbeResult) => void;
}

export function SimulationLab({
  probes,
  isSimulating,
  onApprove,
  isApproving,
  appliedStatus,
  onViewDiff,
  onSelectProbeForInspector,
}: SimulationLabProps) {
  const [selectedProbe, setSelectedProbe] = useState<ProbeResult | null>(null);
  const [isPrePolicyBaseline, setIsPrePolicyBaseline] = useState<boolean>(false);
  const [copiedTerminal, setCopiedTerminal] = useState<boolean>(false);

  const passedCount = probes.filter((p) => p.passed).length;
  const totalCount = probes.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;
  const hasFailures = totalCount > 0 && passedCount < totalCount;

  const activeProbe = selectedProbe || probes[0];

  const handleCopyEvidence = () => {
    if (!activeProbe) return;
    navigator.clipboard.writeText(`${activeProbe.command}\n\n${activeProbe.evidence}`);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  // Group probes into Positive, Negative, Regression, Management
  const positiveProbes = probes.filter((p) => p.category === "positive");
  const negativeProbes = probes.filter((p) => p.category === "negative");
  const regressionProbes = probes.filter((p) => p.category === "regression");
  const managementProbes = probes.filter((p) => p.category === "management");

  return (
    <div className="space-y-5">
      {/* Verified Banner (Section 8.2) */}
      {allPassed && !isSimulating && (
        <div className="neu-raised-md p-5 border-l-4 border-l-[var(--allow)] border-y border-r border-[var(--pal-200)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised-sm flex items-center justify-center text-[var(--allow)]">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--ink-900)]">
                  Verified: {passedCount} of {totalCount} tests passed
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(26,107,67,0.12)] text-[var(--allow)] font-mono">
                  Zero Collateral Damage
                </span>
              </div>
              <p className="text-xs text-[var(--ink-500)] mt-0.5 font-sans">
                Emulated sandbox proved target traffic is blocked while control staff access, gateway DNS, and management plane remain operational.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onViewDiff}
              className="neu-raised-sm px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--ink-700)] hover:text-[var(--ink-900)] cursor-pointer"
            >
              Inspect Rule Diff
            </button>
            <button
              onClick={onApprove}
              disabled={isApproving || appliedStatus === "applied"}
              className="btn-graphite-primary px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {appliedStatus === "applied" ? (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enforcing on Gateway
                </span>
              ) : isApproving ? (
                "Applying..."
              ) : (
                "Approve and apply"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Failure Banner if any probe failed */}
      {hasFailures && !isSimulating && (
        <div className="neu-raised-md p-5 border-l-4 border-l-[var(--deny)] border-y border-r border-[var(--pal-200)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised-sm flex items-center justify-center text-[var(--deny)]">
              <ShieldX className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--deny)]">
                Simulation Failed: {totalCount - passedCount} probe(s) failed
              </h3>
              <p className="text-xs text-[var(--ink-500)]">
                Policy violates expected test plan outcomes. Approval is locked until rules are corrected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Split View: Test Suite Checklist + Live Terminal Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Probe Checklist (5 cols) */}
        <div className="lg:col-span-5 neu-raised-md p-5 border border-[var(--pal-200)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--pal-200)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">Probe Checklist</h3>
              <p className="text-[11px] text-[var(--ink-500)]">Positive, negative & regression tests</p>
            </div>
            <div className="text-xs font-mono font-semibold px-2 py-1 rounded neu-inset text-[var(--ink-900)]">
              {passedCount}/{totalCount || 0} Passed
            </div>
          </div>

          {/* Before/After Segmented Toggle */}
          <div className="my-3 flex items-center justify-between p-2 rounded-xl neu-inset text-xs">
            <span className="text-[var(--ink-500)] font-mono">View State:</span>
            <button
              onClick={() => setIsPrePolicyBaseline(!isPrePolicyBaseline)}
              className="flex items-center gap-1.5 font-medium text-[var(--ink-700)] hover:text-[var(--ink-900)] cursor-pointer"
            >
              <span>{isPrePolicyBaseline ? "Pre-Policy Baseline" : "Candidate Policy (Enforced)"}</span>
              {isPrePolicyBaseline ? (
                <ToggleRight className="w-4 h-4 text-[var(--warn)]" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-[var(--allow)]" />
              )}
            </button>
          </div>

          {/* Grouped Probe Rows */}
          <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
            {probes.length === 0 ? (
              <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
                No active simulation run. Click "Simulate Policy in Sandbox" to execute probes.
              </div>
            ) : (
              probes.map((probe) => {
                const isSelected = activeProbe?.test_id === probe.test_id;

                return (
                  <div
                    key={probe.test_id}
                    onClick={() => {
                      setSelectedProbe(probe);
                      if (onSelectProbeForInspector) onSelectProbeForInspector(probe);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "neu-inset border-[var(--ink-700)] font-semibold"
                        : "neu-raised-sm border-[var(--pal-200)] hover:neu-inset"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {probe.passed ? (
                        <CircleCheck className="w-4 h-4 text-[var(--allow)] shrink-0" strokeWidth={1.75} />
                      ) : (
                        <CircleX className="w-4 h-4 text-[var(--deny)] shrink-0" strokeWidth={1.75} />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-medium text-[var(--ink-900)] block truncate max-w-[210px]">
                          {probe.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--ink-500)] block">
                          Expected: {probe.expected.toUpperCase()} • Actual: {probe.actual.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[var(--ink-500)] tabular-nums">
                        {probe.latency_ms}ms
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProbe(probe);
                          if (onSelectProbeForInspector) onSelectProbeForInspector(probe);
                        }}
                        aria-label="Inspect probe evidence"
                        className="w-6 h-6 rounded neu-raised-sm flex items-center justify-center text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Captured CLI Evidence & Terminal (7 cols) */}
        <div className="lg:col-span-7 neu-raised-md p-5 border border-[var(--pal-200)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--pal-200)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
                <h3 className="text-sm font-bold text-[var(--ink-900)]">
                  Terminal Evidence Stream
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeProbe && (
                  <span className="text-[11px] font-mono text-[var(--ink-500)] neu-inset px-2 py-0.5">
                    {activeProbe.test_id}
                  </span>
                )}
                <button
                  onClick={handleCopyEvidence}
                  aria-label="Copy terminal output"
                  className="w-7 h-7 rounded-lg neu-raised-sm flex items-center justify-center text-[var(--ink-600)] hover:text-[var(--ink-900)] cursor-pointer"
                >
                  {copiedTerminal ? (
                    <Check className="w-3.5 h-3.5 text-[var(--allow)]" strokeWidth={2} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {activeProbe ? (
              <div className="mt-3 space-y-3 font-mono">
                {/* Executed Command Bar */}
                <div className="p-2.5 rounded-xl neu-inset text-xs text-[var(--ink-900)] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[var(--ink-500)] font-bold">$</span>
                    <span className="font-semibold truncate">{activeProbe.command}</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink-500)] shrink-0 font-sans">
                    {activeProbe.timestamp}
                  </span>
                </div>

                {/* Terminal Well */}
                <div className="min-h-[220px] max-h-[300px] p-3.5 rounded-xl neu-inset text-[11px] text-[var(--ink-900)] overflow-y-auto leading-relaxed">
                  <div className="text-[var(--ink-500)] mb-1">
                    # Captured probe stdout / stderr:
                  </div>
                  <pre className="whitespace-pre-wrap">{activeProbe.evidence}</pre>
                </div>

                {/* Kernel Packet Journey Trace */}
                {activeProbe.packet_trace && (
                  <div className="p-3 rounded-xl neu-inset text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-500)] block mb-1">
                      Kernel Hook Evaluation Steps
                    </span>
                    <div className="space-y-1">
                      {activeProbe.packet_trace.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--ink-700)] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink-700)] shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-[var(--ink-500)] text-xs font-mono min-h-[300px]">
                Select a probe from the checklist to review captured output.
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="pt-3 border-t border-[var(--pal-200)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-500)]">
            <span>Namespace: emulated-gw0</span>
            <span>nftables packet traces captured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
