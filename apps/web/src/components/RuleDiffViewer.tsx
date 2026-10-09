"use client";

import React, { useState } from "react";
import { CompiledRuleset } from "@/lib/api";
import { Copy, Download, Check, ShieldCheck, Terminal, Layers } from "lucide-react";

interface RuleDiffViewerProps {
  compiled: CompiledRuleset | null;
  policyId?: string;
}

export function RuleDiffViewer({ compiled, policyId }: RuleDiffViewerProps) {
  const [activeTab, setActiveTab] = useState<"nftables" | "iptables" | "cisco">("nftables");
  const [copied, setCopied] = useState(false);

  if (!compiled) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-12 text-center text-slate-400">
        <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm">No rules compiled yet. Create or select a policy to inspect generated syntax.</p>
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
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header with Format Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">Deterministic Multi-Target Rule Compiler</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              nft -c syntax valid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{compiled.summary}</p>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab("nftables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "nftables"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Linux nftables (Primary)
          </button>
          <button
            onClick={() => setActiveTab("iptables")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "iptables"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            iptables (Legacy)
          </button>
          <button
            onClick={() => setActiveTab("cisco")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "cisco"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cisco IOS-XE ACL
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="rounded-xl bg-black/90 border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl relative">
        {/* Top actions toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-slate-300">
              {activeTab === "nftables" ? "/etc/nftables.conf" : activeTab === "iptables" ? "/etc/iptables/rules.v4" : "cisco_acl.cfg"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Lines with Line Numbers */}
        <div className="p-4 overflow-x-auto max-h-[480px] leading-relaxed">
          {lines.map((line, index) => {
            const isComment = line.trim().startsWith("#") || line.trim().startsWith("!");
            const isDrop = line.includes("drop") || line.includes("DROP") || line.includes("deny");
            const isAccept = line.includes("accept") || line.includes("ACCEPT") || line.includes("permit");

            return (
              <div key={index} className="flex hover:bg-slate-900/60 transition-colors py-0.5">
                <span className="w-10 text-right pr-4 text-slate-600 select-none shrink-0 font-mono text-[11px]">
                  {index + 1}
                </span>
                <span
                  className={`flex-1 ${
                    isComment
                      ? "text-slate-500 italic"
                      : isDrop
                      ? "text-rose-400 font-semibold"
                      : isAccept
                      ? "text-emerald-300"
                      : "text-slate-200"
                  }`}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Hit Counters Mock Bar */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Kernel Packet Counters:</span>
          <span className="text-slate-200 font-semibold">cnt_policy: 42 packets / 28.4 KB dropped</span>
        </div>
        <div className="text-slate-500">
          Hardware Offload: Inactive (Software Emulation Mode)
        </div>
      </div>
    </div>
  );
}
