"use client";

import React, { useState } from "react";
import { CompiledRuleset } from "@/lib/api";
import { Copy, Download, Check, ShieldCheck, FileCode, Layers } from "lucide-react";

interface RuleDiffViewerProps {
  compiled: CompiledRuleset | null;
  policyId?: string;
}

export function RuleDiffViewer({ compiled, policyId }: RuleDiffViewerProps) {
  const [activeTab, setActiveTab] = useState<"nftables" | "iptables" | "cisco">("nftables");
  const [copied, setCopied] = useState(false);

  if (!compiled) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--ink-500)] shadow-xs">
        <Layers className="w-8 h-8 text-[var(--ink-400)] mx-auto mb-3" strokeWidth={1.75} />
        <p className="text-sm font-medium text-[var(--ink-900)]">No firewall rules compiled yet.</p>
        <p className="text-xs text-[var(--ink-400)] mt-1">Enter a security intent in the Firewall Console to inspect generated syntax.</p>
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
    a.download = `firewall_${policyId || "rule"}_${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = getContent().split("\n");

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[var(--ink-900)]" strokeWidth={2} />
            <h3 className="text-sm font-bold text-[var(--ink-900)]">
              Compiled Firewall Ruleset Inspector
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-mono font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Syntax Validated
            </span>
          </div>
          <p className="text-xs text-[var(--ink-500)] mt-0.5 font-mono">{compiled.summary}</p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-well)] border border-[var(--border)]">
          <button
            onClick={() => setActiveTab("nftables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "nftables"
                ? "bg-[var(--ink-900)] text-[var(--bg)] shadow-xs"
                : "text-[var(--ink-700)] hover:text-[var(--ink-900)]"
            }`}
          >
            Linux nftables
          </button>
          <button
            onClick={() => setActiveTab("iptables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "iptables"
                ? "bg-[var(--ink-900)] text-[var(--bg)] shadow-xs"
                : "text-[var(--ink-700)] hover:text-[var(--ink-900)]"
            }`}
          >
            Linux iptables
          </button>
          <button
            onClick={() => setActiveTab("cisco")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "cisco"
                ? "bg-[var(--ink-900)] text-[var(--bg)] shadow-xs"
                : "text-[var(--ink-700)] hover:text-[var(--ink-900)]"
            }`}
          >
            Cisco IOS-XE ACL
          </button>
        </div>
      </div>

      {/* Editor & Actions Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-500)]">
        <div className="flex items-center gap-3">
          <span>Engine: {activeTab === "nftables" ? "nftables 1.0.9 (table inet filter)" : activeTab === "iptables" ? "iptables v1.8 (filter table)" : "Cisco IOS-XE Extended ACL"}</span>
          <span>•</span>
          <span>{lines.length} Lines</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-well)] text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Rules"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-well)] text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Monospace Code Editor Well */}
      <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border)] overflow-hidden font-mono text-xs shadow-inner">
        <div className="max-h-[460px] overflow-y-auto p-4 space-y-1">
          {lines.map((line, idx) => {
            const isComment = line.trim().startsWith("#") || line.trim().startsWith("!");
            const isDrop = line.includes("drop") || line.includes("DROP") || line.includes("deny");
            const isAccept = line.includes("accept") || line.includes("ACCEPT") || line.includes("permit");

            return (
              <div key={idx} className="flex leading-relaxed hover:bg-[var(--border)]/20 px-1 rounded">
                <span className="w-10 text-[var(--ink-400)] select-none text-right pr-4 shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <span
                  className={
                    isComment
                      ? "text-[var(--ink-500)] italic"
                      : isDrop
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : isAccept
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-[var(--ink-900)]"
                  }
                >
                  {line || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
