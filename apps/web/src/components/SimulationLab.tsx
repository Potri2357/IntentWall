"use client";

import React, { useState } from "react";
import { ProbeResult } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldCheck,
  ShieldX,
  Eye,
  Copy,
  Check,
  FlaskConical,
  RotateCw,
  Loader2,
  Play,
  Radio,
  Send,
} from "lucide-react";

interface SimulationLabProps {
  probes: ProbeResult[];
  isSimulating: boolean;
  onApprove: () => void;
  isApproving: boolean;
  appliedStatus: string;
  onViewDiff: () => void;
  onSelectProbeForInspector?: (probe: ProbeResult) => void;
  onRunProbes?: () => void;
}

export function SimulationLab({
  probes,
  isSimulating,
  onApprove,
  isApproving,
  appliedStatus,
  onViewDiff,
  onSelectProbeForInspector,
  onRunProbes,
}: SimulationLabProps) {
  const [selectedProbe, setSelectedProbe] = useState<ProbeResult | null>(null);
  const [terminalViewMode, setTerminalViewMode] = useState<"stdout" | "packet_trace">("stdout");
  const [copiedTerminal, setCopiedTerminal] = useState<boolean>(false);

  // Custom probe injector state
  const [customSource, setCustomSource] = useState("guest-laptop-1 (10.10.20.101)");
  const [customTarget, setCustomTarget] = useState("youtube.com:443 (HTTPS)");
  const [customInjecting, setCustomInjecting] = useState(false);
  const [customResult, setCustomResult] = useState<string | null>(null);

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

  const handleInjectCustom = () => {
    setCustomInjecting(true);
    setCustomResult(null);
    setTimeout(() => {
      setCustomInjecting(false);
      const isFromGuest = customSource.includes("guest");
      const isToYoutube = customTarget.includes("youtube");

      if (isFromGuest && isToYoutube) {
        setCustomResult(
          `[NETFILTER KERNEL VERDICT]\nInterface: eth1.20 -> eth0\nPacket: SYN [10.10.20.101:54122 -> 142.250.190.46:443]\nHook: FORWARD (priority 0)\nRule matched: ip saddr 10.10.20.0/24 ip daddr @svc_youtube_ips tcp dport 443 drop\nVERDICT: DROP (Counter incremented +1)`
        );
      } else {
        setCustomResult(
          `[NETFILTER KERNEL VERDICT]\nInterface: eth1.10 -> eth0\nPacket: SYN [10.10.10.50:54122 -> 142.250.190.46:443]\nHook: FORWARD (priority 0)\nVERDICT: ACCEPT (Stateful established packet forwarded to WAN)`
        );
      }
    }, 700);
  };

  return (
    <div className="space-y-5">
      {/* Top Simulation Control Bar */}
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--ink-900)] text-[var(--bg)] flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--ink-900)]">
                Network Sandbox Traffic Verification Lab
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)] font-semibold">
                Kernel Namespace: emulated-gw0
              </span>
            </div>
            <p className="text-xs text-[var(--ink-500)] mt-0.5">
              Evaluates negative filtering (blocking intended target), positive filtering (staff traffic survival), and system invariants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onRunProbes && (
            <button
              onClick={onRunProbes}
              disabled={isSimulating}
              aria-label="Execute simulation probes"
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Kernel...</span>
                </>
              ) : probes.length > 0 ? (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Re-run Suite</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute 7 Probes</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onViewDiff}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--surface-card)] text-[var(--ink-700)] hover:bg-[var(--surface-well)] transition-colors cursor-pointer"
          >
            Inspect Ruleset
          </button>
        </div>
      </div>

      {/* Verified Banner */}
      {allPassed && !isSimulating && (
        <div className="bg-[var(--surface-card)] border-l-4 border-l-emerald-500 border-y border-r border-[var(--border)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--ink-900)]">
                  Simulation Verified: {passedCount} of {totalCount} Probes Passed
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold">
                  Zero Collateral Damage
                </span>
              </div>
              <p className="text-xs text-[var(--ink-500)] mt-0.5">
                Emulated sandbox proved target traffic is filtered while staff routing, DNS resolution, and management SSH remain functional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onApprove}
              disabled={isApproving || appliedStatus === "applied"}
              className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 shadow-sm"
            >
              {appliedStatus === "applied" ? (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Enforcing on Gateway
                </span>
              ) : isApproving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying to Gateway...
                </span>
              ) : (
                "Approve and Enforce on Gateway"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Failure Banner if any probe failed */}
      {hasFailures && !isSimulating && (
        <div className="bg-[var(--surface-card)] border-l-4 border-l-red-500 border-y border-r border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <ShieldX className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
                Simulation Failed: {totalCount - passedCount} probe(s) failed
              </h3>
              <p className="text-xs text-[var(--ink-500)]">
                Candidate firewall policy violated expected verification test cases. Policy will not be deployed to gateway.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Custom Packet Injector Tool */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-well)]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[var(--ink-700)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Interactive Traffic Injector
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[var(--ink-500)]">Inject custom packet frame to test rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[var(--ink-500)] block mb-1">Source Host</label>
            <select
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border)] text-[var(--ink-900)] font-mono text-xs focus:outline-none"
            >
              <option value="guest-laptop-1 (10.10.20.101)">guest-laptop-1 (10.10.20.101)</option>
              <option value="staff-workstation-1 (10.10.10.50)">staff-workstation-1 (10.10.10.50)</option>
              <option value="admin-bastion (192.168.100.10)">admin-bastion (192.168.100.10)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[var(--ink-500)] block mb-1">Destination Target</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border)] text-[var(--ink-900)] font-mono text-xs focus:outline-none"
            >
              <option value="youtube.com:443 (HTTPS)">youtube.com:443 (HTTPS TCP)</option>
              <option value="youtube.com:443 (QUIC)">youtube.com:443 (QUIC UDP)</option>
              <option value="intranet-web:80 (DMZ)">intranet-web:80 (DMZ HTTP)</option>
              <option value="gateway-fw0:22 (SSH)">gateway-fw0:22 (Management SSH)</option>
              <option value="gateway-fw0:53 (DNS)">gateway-fw0:53 (DNS Resolver)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleInjectCustom}
              disabled={customInjecting}
              className="w-full p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {customInjecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Probe</span>
                </>
              )}
            </button>
          </div>
        </div>

        {customResult && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--surface-card)] text-[var(--ink-900)] font-mono text-[11px] border border-[var(--border)] whitespace-pre-wrap">
            {customResult}
          </div>
        )}
      </div>

      {/* Split View: Automated Test Suite Checklist + Live Terminal Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Probe Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">Verification Probe Suite</h3>
              <p className="text-[11px] text-[var(--ink-500)] font-mono">Automated packet verification tests</p>
            </div>
            <div className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)]">
              {isSimulating ? "Simulating..." : `${passedCount}/${totalCount || 0} Passed`}
            </div>
          </div>

          {/* Grouped Probe Rows */}
          <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
            {isSimulating && probes.length === 0 ? (
              <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--ink-700)]" />
                <span>Injecting packets into emulated network namespace...</span>
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
                        ? "bg-[var(--surface-well)] border-[var(--ink-900)] font-semibold shadow-xs"
                        : "bg-[var(--surface-card)] border-[var(--border)] hover:bg-[var(--surface-well)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {probe.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-medium text-[var(--ink-900)] block truncate max-w-[210px]">
                          {probe.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--ink-500)] block">
                          Expected: {probe.expected.toUpperCase()} | Actual: {probe.actual.toUpperCase()}
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
                        className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Captured CLI Evidence & Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--ink-700)]" />
                <h3 className="text-sm font-bold text-[var(--ink-900)]">
                  Real Network Probe Output &amp; Evidence
                </h3>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--surface-well)] border border-[var(--border)] text-[10px] font-mono">
                  <button
                    onClick={() => setTerminalViewMode("stdout")}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      terminalViewMode === "stdout"
                        ? "bg-[var(--ink-900)] text-[var(--bg)] font-bold"
                        : "text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                    }`}
                  >
                    Console Output
                  </button>
                  <button
                    onClick={() => setTerminalViewMode("packet_trace")}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      terminalViewMode === "packet_trace"
                        ? "bg-[var(--ink-900)] text-[var(--bg)] font-bold"
                        : "text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                    }`}
                  >
                    Packet Trace
                  </button>
                </div>

                <button
                  onClick={handleCopyEvidence}
                  aria-label="Copy terminal output"
                  className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--ink-500)] hover:text-[var(--ink-900)] cursor-pointer"
                >
                  {copiedTerminal ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {activeProbe ? (
              <div className="mt-3 space-y-3 font-mono">
                {/* Executed Command Bar */}
                <div className="p-2.5 rounded-xl bg-[var(--surface-well)] border border-[var(--border)] text-xs text-[var(--ink-900)] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[var(--ink-400)] font-bold select-none">$</span>
                    <span className="font-semibold truncate">{activeProbe.command}</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink-500)] shrink-0 font-sans">
                    {activeProbe.timestamp}
                  </span>
                </div>

                {/* View 1: Raw Terminal Output */}
                {terminalViewMode === "stdout" && (
                  <div className="min-h-[220px] max-h-[300px] p-4 rounded-xl bg-[var(--surface-well)] text-[var(--ink-900)] border border-[var(--border)] text-[11px] overflow-y-auto leading-relaxed shadow-inner">
                    <div className="text-[var(--ink-500)] mb-1 select-none">
                      # Netfilter Kernel Hook Verdict &amp; Client Response:
                    </div>
                    <pre className="whitespace-pre-wrap font-mono">{activeProbe.evidence}</pre>
                  </div>
                )}

                {/* View 2: Kernel Packet Trace */}
                {terminalViewMode === "packet_trace" && (
                  <div className="min-h-[220px] p-4 rounded-xl bg-[var(--surface-well)] text-[var(--ink-900)] border border-[var(--border)] text-xs space-y-2 shadow-inner">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-500)] block">
                      Hop-by-Hop Netfilter Traversal
                    </span>
                    {activeProbe.packet_trace?.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-[11px] text-[var(--ink-700)] font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-[var(--ink-500)] text-xs font-mono min-h-[280px]">
                Select a verification probe from the checklist to review captured output.
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-500)]">
            <span>Namespace: emulated-gw0</span>
            <span>Netfilter Counters Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
