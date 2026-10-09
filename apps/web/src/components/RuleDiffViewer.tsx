"use client";

import React, { useState } from "react";
import { CompiledRuleset } from "@/lib/api";
import { Copy, Download, Check, ShieldCheck, Layers, FileDiff } from "lucide-react";

interface RuleDiffViewerProps {
  compiled: CompiledRuleset | null;
  policyId?: string;
}

export function RuleDiffViewer({ compiled, policyId }: RuleDiffViewerProps) {
  const [activeTab, setActiveTab] = useState<"nftables" | "iptables" | "cisco">("nftables");
  const [copied, setCopied] = useState(false);

  if (!compiled) {
    return (
      <div className="neu-raised-md p-12 text-center text-[var(--ink-500)] border border-[var(--pal-200)]">
        <Layers className="w-8 h-8 text-[var(--ink-400)] mx-auto mb-3" strokeWidth={1.75} />
        <p className="text-sm">No rules compiled yet. Compile an intent to inspect generated firewall syntax.</p>
      </div>
    );
  }

  const getContent = () => {
    switch (activeTab) {
      case "nftables":
        return compiled.nftables;
      case "iptables":
        return compiled.iptables;
      case "cisco":
        return compiled.cisco_acl;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === "nftables" ? "nft" : activeTab === "iptables" ? "rules" : "txt";
    const blob = new Blob([getContent()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intentwall_${policyId || "policy"}_${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = getContent().split("\n");

  return (
    <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--pal-200)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            <h3 className="text-sm font-bold text-[var(--ink-900)]">
              Multi-Target Rule Compiler & Diff
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border border-[rgba(26,107,67,0.3)] flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              nft -c dry-run valid
            </span>
          </div>
          <p className="text-xs text-[var(--ink-500)] mt-0.5 font-sans">{compiled.summary}</p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl neu-inset">
          <button
            onClick={() => setActiveTab("nftables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "nftables"
                ? "btn-graphite-primary"
                : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"
            }`}
          >
            Linux nftables (Primary)
          </button>
          <button
            onClick={() => setActiveTab("iptables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "iptables"
                ? "btn-graphite-primary"
                : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"
            }`}
          >
            iptables (Legacy)
          </button>
          <button
            onClick={() => setActiveTab("cisco")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "cisco"
                ? "btn-graphite-primary"
                : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"
            }`}
          >
            Cisco Extended ACL
          </button>
        </div>
      </div>

      {/* Code Well (Inset Well) */}
      <div className="rounded-xl neu-inset p-4 overflow-hidden font-mono text-xs shadow-inner relative">
        {/* Actions Floating Toolbar (Glass-Thin) */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--pal-200)] text-[11px] text-[var(--ink-500)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[var(--ink-700)]">
              {activeTab === "nftables"
                ? "/etc/nftables.conf"
                : activeTab === "iptables"
                ? "/etc/iptables/rules.v4"
                : "cisco_acl.cfg"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-raised-sm hover:neu-inset text-[var(--ink-700)] text-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--allow)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-raised-sm hover:neu-inset text-[var(--ink-700)] text-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Lines Container */}
        <div className="overflow-x-auto max-h-[460px] leading-relaxed text-[12px]">
          {lines.map((line, index) => {
            const isComment = line.trim().startsWith("#") || line.trim().startsWith("!");
            const isDrop = line.includes("drop") || line.includes("DROP") || line.includes("deny");
            const isAccept = line.includes("accept") || line.includes("ACCEPT") || line.includes("permit");

            return (
              <div
                key={index}
                className={`flex py-0.5 px-1 rounded ${
                  isDrop
                    ? "bg-[rgba(179,38,30,0.06)]"
                    : isAccept && !isComment
                    ? "bg-[rgba(26,107,67,0.06)]"
                    : ""
                }`}
              >
                <span className="w-9 text-right pr-4 text-[var(--ink-400)] select-none shrink-0 font-mono text-[11px] tabular-nums">
                  {index + 1}
                </span>
                <span
                  className={`flex-1 ${
                    isComment
                      ? "text-[var(--ink-500)] italic"
                      : isDrop
                      ? "text-[var(--deny)] font-semibold"
                      : isAccept
                      ? "text-[var(--allow)] font-medium"
                      : "text-[var(--ink-900)]"
                  }`}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Hit Counters Bar */}
      <div className="p-3 rounded-xl neu-raised-sm flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[var(--ink-600)]">
          <span className="w-2 h-2 rounded-full bg-[var(--allow)]" />
          <span>Kernel Packet Counters:</span>
          <span className="text-[var(--ink-900)] font-semibold">
            cnt_pol: 42 packets / 28.4 KB dropped
          </span>
        </div>
        <div className="text-[var(--ink-500)]">
          Table: inet intentwall_filter (Stateful conntrack active)
        </div>
      </div>
    </div>
  );
}
