"use client";

import React from "react";
import { Activity, Search, Sun, Moon, ShieldCheck, Command } from "lucide-react";

interface TopBarProps {
  activeTab: string;
  onOpenCommandPalette: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  policyId?: string | null;
}

export function TopBar({
  activeTab,
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
  policyId,
}: TopBarProps) {
  const tabTitles: Record<string, string> = {
    command: "Command Center",
    simulation: "Simulation Lab",
    policies: "Policy Library",
    diff: "Rule Diff",
    audit: "Audit Trail",
    inventory: "Network & Services",
    benchmark: "Benchmark 100",
    settings: "Settings",
  };

  return (
    <header className="sticky top-0 z-20 glass-thin border-b border-[var(--pal-200)] px-6 py-3 mb-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--ink-500)] font-medium">Intentwall</span>
        <span className="text-[var(--ink-500)]">/</span>
        <span className="text-[var(--ink-900)] font-semibold">{tabTitles[activeTab] || "Overview"}</span>
        {policyId && (
          <>
            <span className="text-[var(--ink-500)]">/</span>
            <span className="font-mono text-[var(--ink-600)] px-1.5 py-0.5 rounded neu-inset text-[11px]">
              {policyId}
            </span>
          </>
        )}
      </div>

      {/* Right Tools: Status, Command Palette, Theme */}
      <div className="flex items-center gap-3">
        {/* Sandbox Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-raised-sm border border-[var(--pal-200)] text-[11px] font-mono text-[var(--allow)]">
          <Activity className="w-3.5 h-3.5 animate-pulse" strokeWidth={1.75} />
          <span>Sandbox ready</span>
        </div>

        {/* Lockout Guard Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-raised-sm border border-[var(--pal-200)] text-[11px] font-mono text-[var(--ink-700)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--allow)]" strokeWidth={1.75} />
          <span>Lockout Guard Active</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open Command Palette"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-raised-sm text-xs text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="hidden md:inline text-[11px]">Search commands...</span>
          <kbd className="hidden md:inline font-mono text-[10px] px-1.5 py-0.5 rounded neu-inset text-[var(--ink-500)]">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          className="w-8 h-8 rounded-xl neu-raised-sm flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-all cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
}
