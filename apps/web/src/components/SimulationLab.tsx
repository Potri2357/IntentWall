"use client";

import React, { useState } from "react";
import { ProbeResult } from "@/lib/api";
import { CheckCircle2, XCircle, Terminal, Play, ShieldCheck, Clock, Download, ArrowRight, ToggleLeft, ToggleRight } from "lucide-react";

interface SimulationLabProps {
  probes: ProbeResult[];
  isSimulating: boolean;
  onApprove: () => void;
  isApproving: boolean;
  appliedStatus: string;
  onViewDiff: () => void;
}

export function SimulationLab({
  probes,
  isSimulating,
  onApprove,
  isApproving,
  appliedStatus,
  onViewDiff,
}: SimulationLabProps) {
  const [selectedProbe, setSelectedProbe] = useState<ProbeResult | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);

  const passedCount = probes.filter((p) => p.passed).length;
  const totalCount = probes.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  // Active probe selection default
  const activeProbe = selectedProbe || probes[0];

  return (
    <div className="space-y-5">
      {/* Verification Banner */}
      {allPassed && !isSimulating && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-emerald-200">
                  Policy Verified: {passedCount}/{totalCount} Probes Passed
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Zero Collateral Damage
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Emulated sandbox proved target traffic is safely blocked while staff access, DNS resolution, and management planes remain 100% operational.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onViewDiff}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Inspect Rules Diff
            </button>
            <button
              onClick={onApprove}
              disabled={isApproving || appliedStatus === "applied"}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {appliedStatus === "applied" ? "Enforcing on Gateway ✓" : isApproving ? "Applying..." : "Approve & Ship Policy"}
            </button>
          </div>
        </div>
      )}

      {/* Split View: Test Suite Checklist + Live Terminal Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Probe Checklist (5 cols) */}
        <div className="lg:col-span-5 glass-panel-elevated rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Automated Probe Suite</h3>
              <p className="text-[11px] text-slate-400">Positive, negative & regression probes</p>
            </div>
            <div className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-900 text-indigo-300 border border-slate-800">
              {passedCount}/{totalCount || 0} Passed
            </div>
          </div>

          {/* Before/After Toggle */}
          <div className="my-3 flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">View State:</span>
            <button
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              className="flex items-center gap-1.5 font-medium text-slate-300 hover:text-white"
            >
              <span>{showBeforeAfter ? "Pre-Policy Baseline" : "Candidate Policy (Enforced)"}</span>
              {showBeforeAfter ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Probe Cards List */}
          <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
            {probes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No active simulation. Click "Simulate & Prove Policy" above.
              </div>
            ) : (
              probes.map((probe) => {
                const isSelected = activeProbe?.test_id === probe.test_id;
                const isNegative = probe.category === "negative";
                const isRegression = probe.category === "regression";
                const isManagement = probe.category === "management";

                return (
                  <div
                    key={probe.test_id}
                    onClick={() => setSelectedProbe(probe)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-indigo-500/80 shadow-md"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {probe.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[210px]">
                          {probe.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            isNegative
                              ? "bg-red-500/10 text-red-300 border border-red-500/30"
                              : isRegression
                              ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                              : isManagement
                              ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {probe.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {probe.latency_ms}ms
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Expected: {probe.expected.toUpperCase()}</span>
                      <span className={probe.actual === probe.expected ? "text-emerald-400" : "text-rose-400"}>
                        Actual: {probe.actual.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Captured CLI Evidence & Terminal (7 cols) */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-2xl p-5 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Live Traffic Probe Evidence</h3>
            </div>
            {activeProbe && (
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeProbe.test_id}
              </span>
            )}
          </div>

          {activeProbe ? (
            <div className="mt-3 flex-1 flex flex-col space-y-3 font-mono">
              {/* Executed Command Bar */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500">$</span>
                  <span className="font-semibold">{activeProbe.command}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{activeProbe.timestamp}</span>
              </div>

              {/* Terminal Output */}
              <div className="flex-1 min-h-[220px] p-3.5 rounded-xl bg-black/80 border border-slate-800 text-[11px] text-slate-300 overflow-y-auto leading-relaxed shadow-inner">
                <div className="text-slate-500 mb-2"># Captured stdout / stderr evidence from sandbox gateway:</div>
                <pre className="whitespace-pre-wrap">{activeProbe.evidence}</pre>
              </div>

              {/* Packet Flow Trace Details */}
              {activeProbe.packet_trace && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs">
                  <span className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Packet Journey & Kernel Hooks
                  </span>
                  <div className="space-y-1">
                    {activeProbe.packet_trace.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono min-h-[300px]">
              Select a probe from the checklist to review captured output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
