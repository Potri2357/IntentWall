"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  LayoutDashboard,
  FlaskConical,
  Library,
  FileDiff,
  ScrollText,
  Network,
  Activity,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onSelectPrompt,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null; // toggle handled externally
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: "Go to Command Center", tab: "command", icon: LayoutDashboard },
    { label: "Open Simulation Lab", tab: "simulation", icon: FlaskConical },
    { label: "View Policy Library", tab: "policies", icon: Library },
    { label: "Inspect Rule Diff (nftables)", tab: "diff", icon: FileDiff },
    { label: "Open Audit Trail", tab: "audit", icon: ScrollText },
    { label: "Inspect Network & Service Catalog", tab: "inventory", icon: Network },
    { label: "Run 100-Prompt Benchmark", tab: "benchmark", icon: Activity },
    { label: "Configure Settings", tab: "settings", icon: Settings },
  ];

  const presets = [
    { label: "Block YouTube for the guest network", prompt: "Block YouTube for the guest network" },
    { label: "Isolate guest Wi-Fi from internal servers", prompt: "Isolate the guest Wi-Fi from internal servers" },
    { label: "Rate limit guest network to 100 packets per minute", prompt: "Rate limit guest network outbound traffic to 100 packets per minute" },
    { label: "Test Lockout Guard: Block all traffic on port 22", prompt: "Block all traffic on port 22" },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredPresets = presets.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl glass-strong rounded-2xl p-4 border border-[var(--pal-200)] shadow-2xl relative"
        style={{ backdropFilter: "blur(24px)" }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl neu-inset">
          <Search className="w-4 h-4 text-[var(--ink-500)] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search views, actions, or firewall scenarios..."
            autoFocus
            className="w-full bg-transparent text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close Command Palette"
            className="text-[var(--ink-500)] hover:text-[var(--ink-900)] cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* Navigation Items */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] px-2 block mb-1">
              Navigation
            </span>
            <div className="space-y-1">
              {filteredActions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectTab(item.tab);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left neu-raised-sm hover:neu-inset text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[var(--ink-500)]" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Scenario Prompts */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] px-2 block mb-1">
              Security Scenarios
            </span>
            <div className="space-y-1">
              {filteredPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(preset.prompt);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left neu-raised-sm hover:neu-inset text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[var(--ink-500)]" strokeWidth={1.75} />
                  <span className="font-mono text-[11px] truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="mt-3 pt-2.5 border-t border-[var(--pal-200)] flex items-center justify-between text-[11px] text-[var(--ink-500)] font-mono">
          <span>Esc to exit</span>
          <span>Enter to select</span>
        </div>
      </div>
    </div>
  );
}
