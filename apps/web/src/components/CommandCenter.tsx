"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowUp,
  Shield,
  ShieldAlert,
  Network,
  Activity,
  Globe,
  Cpu,
  History,
  RotateCcw,
} from "lucide-react";

interface CommandCenterProps {
  onParseIntent: (prompt: string, provider: string) => void;
  isParsing: boolean;
  history: string[];
}

export function CommandCenter({ onParseIntent, isParsing, history }: CommandCenterProps) {
  const [prompt, setPrompt] = useState("Block YouTube for the guest network");
  const [provider, setProvider] = useState("auto");

  // Chips with Lucide icons (Strictly NO EMOJIS per PRD Section 5 & 16)
  const suggestionChips = [
    {
      label: "Block YouTube for guest network",
      prompt: "Block YouTube for the guest network",
      icon: ShieldAlert,
    },
    {
      label: "Isolate guest Wi-Fi from internal servers",
      prompt: "Isolate the guest Wi-Fi from internal servers",
      icon: Network,
    },
    {
      label: "Rate limit guest network to 100 packets/min",
      prompt: "Rate limit guest network outbound traffic to 100 packets per minute",
      icon: Activity,
    },
    {
      label: "Block port 22 (Lockout Guard test)",
      prompt: "Block all traffic on port 22",
      icon: Shield,
      isAdversarial: true,
    },
    {
      label: "Allow guest research access to Wikipedia",
      prompt: "Allow guest devices to browse Wikipedia for student education",
      icon: Globe,
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isParsing) return;
    onParseIntent(prompt.trim(), provider);
  };

  return (
    <div className="neu-raised-lg p-6 relative border border-[var(--pal-200)] transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            Natural-Language Policy Intake
          </h2>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Express security requirements in plain English. Intentwall compiles to typed IR, validates safety invariants, and verifies rules in a live network sandbox.
          </p>
        </div>

        {/* Model Provider Selector */}
        <div className="flex items-center gap-2 neu-raised-sm px-3 py-1.5 text-xs border border-[var(--pal-200)]">
          <Cpu className="w-3.5 h-3.5 text-[var(--ink-700)]" strokeWidth={1.75} />
          <span className="text-[var(--ink-500)] text-[11px] font-mono">Model:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-transparent text-[var(--ink-900)] text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="auto">Auto (Gemini + Local Fallback)</option>
            <option value="gemini">Google Gemini 2.5 Flash</option>
            <option value="ollama">Local Ollama (Offline)</option>
            <option value="deterministic">Deterministic Keyword Parser</option>
          </select>
        </div>
      </div>

      {/* Main Prompt Bar (Hero) */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="neu-inset p-2.5 rounded-2xl flex items-center gap-3 transition-all">
          <Sparkles className="w-4 h-4 text-[var(--ink-500)] ml-2 shrink-0" strokeWidth={1.75} />
          <textarea
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="What should the network do? e.g. Block YouTube for the guest network"
            disabled={isParsing}
            className="w-full bg-transparent py-1.5 text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none resize-none font-sans"
          />

          <button
            type="submit"
            disabled={isParsing || !prompt.trim()}
            aria-label="Compile and verify intent"
            className="btn-graphite-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isParsing ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ArrowUp className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Compile</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-[var(--ink-500)]">Examples:</span>
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
              className={`neu-raised-sm px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:neu-inset ${
                chip.isAdversarial
                  ? "text-[var(--deny)] hover:text-[var(--deny)]"
                  : "text-[var(--ink-700)] hover:text-[var(--ink-900)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--pal-200)] flex items-center gap-2 overflow-x-auto text-[11px] text-[var(--ink-500)]">
          <History className="w-3 h-3 text-[var(--ink-500)] shrink-0" strokeWidth={1.75} />
          <span className="shrink-0 font-mono">Recent:</span>
          {history.slice(0, 4).map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(h);
                onParseIntent(h, provider);
              }}
              className="text-[var(--ink-600)] hover:text-[var(--ink-900)] truncate max-w-[220px] cursor-pointer"
            >
              "{h}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
