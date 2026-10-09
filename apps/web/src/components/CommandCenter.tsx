"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, ShieldAlert, Cpu, History, Check, AlertCircle } from "lucide-react";

interface CommandCenterProps {
  onParseIntent: (prompt: string, provider: string) => void;
  isParsing: boolean;
  history: string[];
}

export function CommandCenter({ onParseIntent, isParsing, history }: CommandCenterProps) {
  const [prompt, setPrompt] = useState("Block YouTube for the guest network");
  const [provider, setProvider] = useState("auto");

  const suggestionChips = [
    { label: "Block YouTube for guest network", prompt: "Block YouTube for the guest network", type: "primary" },
    { label: "Isolate guest Wi-Fi from internal servers", prompt: "Isolate the guest Wi-Fi from internal servers", type: "segmentation" },
    { label: "Rate limit guest network to 100/min", prompt: "Rate limit guest network outbound traffic to 100 packets per minute", type: "ratelimit" },
    { label: "⚠️ Block port 22 [Safety Guard Demo]", prompt: "Block all traffic on port 22", type: "adversarial" },
    { label: "Permit research access to Wikipedia", prompt: "Allow guest devices to browse Wikipedia for student education", type: "allow" }
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isParsing) return;
    onParseIntent(prompt.trim(), provider);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Natural-Language Firewall Intake
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe security requirements in plain English. Intentwall extracts typed IR, enforces safety guards, and proves rules via sandbox emulation.
          </p>
        </div>

        {/* Model Provider Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 text-[11px]">Model:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="auto" className="bg-slate-900 text-slate-200">Auto (Gemini + Local Fallback)</option>
            <option value="gemini" className="bg-slate-900 text-slate-200">Google Gemini 2.5 Flash</option>
            <option value="ollama" className="bg-slate-900 text-slate-200">Local Ollama (Offline)</option>
            <option value="deterministic" className="bg-slate-900 text-slate-200">Deterministic Keyword Parser</option>
          </select>
        </div>
      </div>

      {/* Main Prompt Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-indigo-500/30 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-inner transition-all">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Block YouTube for the guest network, or Isolate servers from staff..."
            disabled={isParsing}
            className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isParsing || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {isParsing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Translating Intent...</span>
              </>
            ) : (
              <>
                <span>Compile Intent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          Try scenarios:
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(chip.prompt);
              onParseIntent(chip.prompt, provider);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
              chip.type === "adversarial"
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                : chip.type === "primary"
                ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/25"
                : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Recent History Bar */}
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <History className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="shrink-0">Recent:</span>
          {history.slice(0, 4).map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(h);
                onParseIntent(h, provider);
              }}
              className="text-slate-300 hover:text-indigo-400 hover:underline truncate max-w-[200px]"
            >
              "{h}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
