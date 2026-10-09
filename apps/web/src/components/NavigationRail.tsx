"use client";

import React, { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  FlaskConical,
  Library,
  FileDiff,
  ScrollText,
  Network,
  Activity,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface NavigationRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  policyCount?: number;
}

export function NavigationRail({ activeTab, setActiveTab, policyCount }: NavigationRailProps) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = pinned || hovered;

  const navItems = [
    { id: "command", label: "Command Center", icon: LayoutDashboard },
    { id: "simulation", label: "Simulation Lab", icon: FlaskConical },
    { id: "policies", label: "Policy Library", icon: Library, badge: policyCount },
    { id: "diff", label: "Rule Diff", icon: FileDiff },
    { id: "audit", label: "Audit Trail", icon: ScrollText },
    { id: "inventory", label: "Network & Services", icon: Network },
    { id: "benchmark", label: "Benchmark 100", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-out neu-raised-md border-r border-[var(--pal-200)] flex flex-col justify-between py-4 select-none ${
        isExpanded ? "w-60 px-3" : "w-[72px] px-2.5"
      }`}
      style={{
        background: "var(--surface-card)",
      }}
    >
      {/* Top Logo */}
      <div>
        <div
          onClick={() => setActiveTab("command")}
          className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl neu-raised-sm flex items-center justify-center shrink-0 border border-[var(--pal-200)] bg-[var(--surface-card)]">
            <Shield className="w-5 h-5 text-[var(--ink-900)]" strokeWidth={1.75} />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight text-[var(--ink-900)] block">
                Intentwall
              </span>
              <span className="text-[11px] text-[var(--ink-500)] block font-mono">
                Soft Graphite
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "neu-inset text-[var(--ink-900)] font-semibold"
                    : "neu-raised-sm text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--pal-50)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                {isExpanded && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[var(--pal-200)] text-[var(--ink-700)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pin/Collapse Footer */}
      <div className="pt-3 border-t border-[var(--pal-200)]">
        <button
          onClick={() => setPinned(!pinned)}
          aria-label={pinned ? "Collapse sidebar" : "Pin sidebar"}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors cursor-pointer"
        >
          {pinned ? (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              {isExpanded && <span>Unpin Sidebar</span>}
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              {isExpanded && <span>Pin Sidebar</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
