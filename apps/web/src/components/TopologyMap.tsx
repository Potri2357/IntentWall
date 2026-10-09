"use client";

import React, { useState } from "react";
import { Globe, Shield, Users, Briefcase, Server, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TopologyMapProps {
  blockedTarget?: string;
  isSimulating?: boolean;
  simulationProgress?: string;
  lastSimResult?: {
    passed: boolean;
    all_passed?: boolean;
    blockedTrafficCount?: number;
  };
}

export function TopologyMap({
  blockedTarget = "youtube",
  isSimulating = false,
  simulationProgress,
  lastSimResult,
}: TopologyMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>("gateway");

  const nodes = [
    {
      id: "wan",
      title: "Internet / WAN",
      cidr: "0.0.0.0/0",
      icon: Globe,
      color: "from-blue-600 to-cyan-500",
      x: 50,
      y: 12,
      details: ["youtube.com (142.250.190.46)", "netflix.com (198.38.118.140)", "wikipedia.org (198.35.26.96)"],
    },
    {
      id: "gateway",
      title: "Intentwall Gateway",
      cidr: "10.10.1.1 (nftables)",
      icon: Shield,
      color: "from-indigo-600 to-violet-500",
      x: 50,
      y: 45,
      details: ["Linux kernel 6.6+", "nftables table inet intentwall_filter", "Stateful conntrack active", "Lockout Guard: Port 22/8000/53"],
    },
    {
      id: "guest",
      title: "Guest Wi-Fi (VLAN 20)",
      cidr: "10.10.20.0/24",
      icon: Users,
      color: "from-amber-500 to-orange-500",
      x: 18,
      y: 80,
      details: ["guest-laptop-1 (10.10.20.101)", "guest-phone-2 (10.10.20.102)"],
    },
    {
      id: "staff",
      title: "Staff Workstations (VLAN 10)",
      cidr: "10.10.10.0/24",
      icon: Briefcase,
      color: "from-emerald-500 to-teal-500",
      x: 42,
      y: 82,
      details: ["staff-workstation-1 (10.10.10.50)", "Full internet & Intranet permitted"],
    },
    {
      id: "servers",
      title: "Internal Servers (VLAN 30)",
      cidr: "10.10.30.0/24",
      icon: Server,
      color: "from-purple-500 to-pink-500",
      x: 68,
      y: 82,
      details: ["intranet-web (10.10.30.10:80)", "db-cluster (10.10.30.20:5432)"],
    },
    {
      id: "mgmt",
      title: "Management Bastion (VLAN 100)",
      cidr: "192.168.100.0/24",
      icon: Lock,
      color: "from-rose-500 to-red-600",
      x: 88,
      y: 78,
      details: ["admin-bastion (192.168.100.10)", "Protected by Lockout Guard"],
    },
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-100">Live Emulated Network Topology</h3>
          <span className="text-[11px] font-mono text-slate-400">Mininet / Linux Namespaces</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isSimulating && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Probing traffic flows: {simulationProgress || "Running..."}</span>
            </div>
          )}
          {lastSimResult && !isSimulating && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium">Verification Proven: Probes Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Topology SVG + Canvas */}
      <div className="relative w-full h-[340px] mt-2 select-none">
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Uplink: Gateway to WAN */}
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="15"
            stroke="#475569"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Guest to Gateway edge */}
          <line
            x1="22"
            y1="76"
            x2="48"
            y2="47"
            stroke={blockedTarget ? "#ef4444" : "#10b981"}
            strokeWidth="1.2"
            className={blockedTarget ? "packet-anim-red" : "packet-anim-green"}
          />

          {/* Staff to Gateway edge (Always Green) */}
          <line
            x1="43"
            y1="78"
            x2="49"
            y2="47"
            stroke="#10b981"
            strokeWidth="1.2"
            className="packet-anim-green"
          />

          {/* Servers to Gateway edge */}
          <line
            x1="66"
            y1="78"
            x2="51"
            y2="47"
            stroke="#10b981"
            strokeWidth="1"
            className="packet-anim-green"
          />

          {/* Management to Gateway edge (Lockout Protected) */}
          <line
            x1="86"
            y1="74"
            x2="52"
            y2="47"
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          const isGuestBlocked = node.id === "guest" && Boolean(blockedTarget);

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`absolute cursor-pointer group transition-all duration-300 z-20 flex flex-col items-center`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center p-[2px] transition-transform duration-200 group-hover:scale-110 shadow-lg ${
                  isSelected
                    ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105"
                    : ""
                } bg-gradient-to-tr ${node.color}`}
              >
                <div className="w-full h-full bg-slate-950/90 rounded-2xl flex items-center justify-center relative">
                  <Icon className="w-5 h-5 text-white" />
                  {isGuestBlocked && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
                      ✕
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-1.5 text-center">
                <span className="text-[12px] font-semibold text-slate-200 block whitespace-nowrap">
                  {node.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">{node.cidr}</span>
              </div>
            </div>
          );
        })}

        {/* Target Policy Visual Badge in Center */}
        {blockedTarget && (
          <div className="absolute top-[32%] left-[30%] -translate-x-1/2 bg-red-950/80 border border-red-500/40 rounded-lg px-2.5 py-1 text-[11px] text-red-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono">DENY: guest -&gt; {blockedTarget}</span>
          </div>
        )}
      </div>

      {/* Selected Node Details Bar */}
      {selectedNode && (
        <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Inspecting Node:</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {nodes.find((n) => n.id === selectedNode)?.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nodes
              .find((n) => n.id === selectedNode)
              ?.details.map((detail, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono text-[11px] border border-slate-700/50"
                >
                  {detail}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
