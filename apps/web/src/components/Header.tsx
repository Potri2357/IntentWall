"use client";

import React from "react";
import { Shield, Activity, Terminal, Layers, FileText, Database, PlayCircle } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePolicyCount: number;
}

export function Header({ activeTab, setActiveTab, activePolicyCount }: HeaderProps) {
  const tabs = [
    { id: "command", label: "Command Center", icon: Terminal },
    { id: "simulation", label: "Simulation Lab", icon: PlayCircle },
    { id: "diff", label: "Rule Diff", icon: Layers },
    { id: "policies", label: "Policies", icon: Shield, badge: activePolicyCount },
    { id: "audit", label: "Audit Trail", icon: FileText },
    { id: "inventory", label: "Network & Services", icon: Database },
    { id: "benchmark", label: "Benchmark 100", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("command")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Intentwall</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Natural-language firewall with live network sandbox emulation
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-medium text-[11px]">Sandbox Active</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span className="font-medium text-[11px]">Lockout Guard ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 gap-1 border-t border-slate-800/60 bg-slate-900/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
