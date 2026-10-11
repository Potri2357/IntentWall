"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  Network,
  Activity,
  Globe,
  Cpu,
  History,
  Send,
  Loader2,
  Sparkles,
  Terminal,
} from "lucide-react";

interface CommandCenterProps {
  onParseIntent: (prompt: string, provider: string) => void;
  isParsing: boolean;
  history: string[];
}

export function CommandCenter({ onParseIntent, isParsing, history }: CommandCenterProps) {
  const [prompt, setPrompt] = useState("Block YouTube for the guest network");
  const [provider, setProvider] = useState("auto");

  const suggestionChips = [
    {
      category: "Content Filter",
      label: "Block YouTube on Guest (VLAN 20)",
      prompt: "Block YouTube for the guest network",
      icon: ShieldAlert,
    },
    {
      category: "VLAN Isolation",
      label: "Isolate Guest from DMZ Servers (VLAN 30)",
      prompt: "Isolate the guest Wi-Fi from internal servers",
      icon: Network,
    },
    {
      category: "Safety Check",
      label: "Block Port 22 (Lockout Guard test)",
      prompt: "Block all traffic on port 22",
      icon: Shield,
      isAdversarial: true,
    },
    {
      category: "Workstation Policy",
      label: "Allow Staff Intranet Access (80/443)",
      prompt: "Allow staff workstations to reach internal servers on ports 80 and 443",
      icon: Globe,
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isParsing) return;
    onParseIntent(prompt.trim(), provider);
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--ink-900)] text-[var(--bg)] flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--ink-900)]">
                Firewall Intent Intake Console
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)] font-semibold">
                RFC-Validated
              </span>
            </div>
            <p className="text-xs text-[var(--ink-500)] mt-0.5">
              Specify plain-English network security policies. Intentwall parses, proves via emulated sandbox, and compiles to Linux netfilter.
            </p>
          </div>
        </div>

        {/* Inference Engine Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-well)] text-xs shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-[var(--ink-500)]" />
          <span className="text-[11px] font-mono text-[var(--ink-500)]">Engine:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[var(--ink-900)] focus:outline-none cursor-pointer"
          >
            <option value="auto">Auto (Gemini + Local Fallback)</option>
            <option value="deterministic">Deterministic Parser (Offline)</option>
            <option value="gemini">Google Gemini 2.5 Flash</option>
            <option value="ollama">Local Ollama (Self-Hosted)</option>
          </select>
        </div>
      </div>

      {/* Main Command Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="p-3.5 rounded-xl border-2 border-[var(--border)] focus-within:border-[var(--ink-900)] bg-[var(--surface-well)] transition-all shadow-inner">
          <div className="flex items-start gap-3">
            <span className="text-[var(--ink-400)] font-mono text-sm pt-1 select-none font-bold">$</span>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type your security rule requirement (e.g. Block YouTube for the guest network)..."
              disabled={isParsing}
              className="w-full bg-transparent text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Action Row Inside Console */}
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ink-500)]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] text-[10px] text-[var(--ink-700)] border border-[var(--border)]">⏎ Return</kbd>
                <span>to compile</span>
              </span>
              <span>•</span>
              <span>Stateful Verification Active</span>
            </div>

            <button
              type="submit"
              disabled={isParsing || !prompt.trim()}
              aria-label="Compile and verify intent"
              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compile &amp; Verify</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preset Intent Examples with Category Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-[var(--ink-500)] uppercase tracking-wider font-semibold">
            Suggested Verification Scenarios
          </span>
          <span className="text-[11px] font-mono text-[var(--ink-400)]">Click to load and execute</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {suggestionChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(chip.prompt);
                  onParseIntent(chip.prompt, provider);
                }}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  chip.isAdversarial
                    ? "bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 hover:border-red-400 text-red-900 dark:text-red-200"
                    : "bg-[var(--surface-card)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-well)] text-[var(--ink-900)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] font-bold">
                    {chip.category}
                  </span>
                </div>
                <span className="text-xs font-semibold block leading-snug line-clamp-2">
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* History Drawer */}
      {history.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto text-[11px] text-[var(--ink-500)]">
          <History className="w-3.5 h-3.5 text-[var(--ink-400)] shrink-0" strokeWidth={1.75} />
          <span className="shrink-0 font-mono font-medium">Recent Inputs:</span>
          {history.slice(0, 4).map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(h);
                onParseIntent(h, provider);
              }}
              className="text-[var(--ink-700)] hover:text-[var(--ink-900)] truncate max-w-[220px] cursor-pointer font-mono hover:underline"
            >
              "{h}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
