"use client";

import React from "react";
import { Activity, Search, Sun, Moon, ShieldCheck } from "lucide-react";

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
    command: "Firewall Console",
    simulation: "Simulation Probes",
    diff: "Firewall Rulesets",
    policies: "Active Policies",
    inventory: "Network Architecture",
    audit: "Audit Log",
    settings: "System Settings",
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface-card)] border-b border-[var(--border)] px-6 py-3 mb-6 flex items-center justify-between backdrop-blur-md shadow-xs transition-colors">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--ink-500)] font-medium">Intentwall</span>
        <span className="text-[var(--ink-400)]">/</span>
        <span className="text-[var(--ink-900)] font-semibold">
          {tabTitles[activeTab] || "Firewall Console"}
        </span>
        {policyId && (
          <>
            <span className="text-[var(--ink-400)]">/</span>
            <span className="font-mono text-[var(--ink-700)] px-1.5 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)] text-[11px]">
              {policyId}
            </span>
          </>
        )}
      </div>

      {/* Right Tools: Status, Command Palette, Theme */}
      <div className="flex items-center gap-2.5">
        {/* Sandbox Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
          <Activity className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Sandbox Ready</span>
        </div>

        {/* Lockout Guard Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--surface-well)] text-[11px] font-mono text-[var(--ink-700)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>Lockout Guard Active</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open Command Palette"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-well)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="hidden md:inline text-[11px]">Search commands...</span>
          <kbd className="hidden md:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border)] text-[var(--ink-500)]">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-well)] flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-colors cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
}
