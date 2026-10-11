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
    { id: "command", label: "Firewall Console", icon: LayoutDashboard },
    { id: "simulation", label: "Simulation Probes", icon: FlaskConical },
    { id: "diff", label: "Firewall Rulesets", icon: FileDiff },
    { id: "policies", label: "Active Policies", icon: Library, badge: policyCount },
    { id: "inventory", label: "Network Architecture", icon: Network },
    { id: "audit", label: "Audit Log", icon: ScrollText },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-30 transition-all duration-200 ease-out bg-[var(--surface-sidebar)] border-r border-[var(--border)] flex flex-col justify-between py-4 select-none shadow-xs ${
        isExpanded ? "w-60 px-3" : "w-[72px] px-2.5"
      }`}
    >
      {/* Top Logo */}
      <div>
        <div
          onClick={() => setActiveTab("command")}
          className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-[var(--surface-well)] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--ink-900)] text-[var(--bg)] flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-5 h-5" strokeWidth={2} />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold tracking-tight text-[var(--ink-900)] block">
                Intentwall
              </span>
              <span className="text-[11px] text-[var(--ink-500)] block font-mono">
                Network Security Core
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--ink-900)] text-[var(--bg)] font-semibold shadow-xs"
                    : "text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-well)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                {isExpanded && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface-well)] text-[var(--ink-700)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pin/Collapse Footer */}
      <div className="pt-3 border-t border-[var(--border)]">
        <button
          onClick={() => setPinned(!pinned)}
          aria-label={pinned ? "Collapse sidebar" : "Pin sidebar"}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-well)] transition-colors cursor-pointer"
        >
          {pinned ? (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              {isExpanded && <span>Collapse Sidebar</span>}
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
