"use client";

import React, { useState } from "react";
import {
  Globe,
  Shield,
  Wifi,
  Laptop,
  Server,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  List,
  ShieldX,
  ShieldCheck,
  Activity,
  Workflow,
} from "lucide-react";

interface TopologyCanvasProps {
  blockedTarget?: string;
  isSimulating?: boolean;
  simulationProgress?: string;
  lastSimResult?: {
    passed: boolean;
    all_passed?: boolean;
  };
  onSelectNode?: (nodeData: any) => void;
}

export function TopologyCanvas({
  blockedTarget = "youtube",
  isSimulating = false,
  simulationProgress,
  lastSimResult,
  onSelectNode,
}: TopologyCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<string>("gateway");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showTableView, setShowTableView] = useState<boolean>(false);

  const nodes = [
    {
      id: "wan",
      title: "Internet / WAN",
      cidr: "0.0.0.0/0",
      icon: Globe,
      x: 50,
      y: 14,
      details: [
        "youtube.com (142.250.190.46:443)",
        "netflix.com (198.38.118.140:443)",
        "wikipedia.org (198.35.26.96:443)",
      ],
    },
    {
      id: "gateway",
      title: "Gateway Firewall",
      cidr: "10.10.1.1 (Linux nftables)",
      icon: Shield,
      x: 50,
      y: 46,
      isGateway: true,
      details: [
        "Core nftables table inet intentwall_filter",
        "Stateful conntrack: established,related accept",
        "Lockout Guard: Invariants enforced for SSH, DNS, API",
      ],
    },
    {
      id: "guest",
      title: "Guest Wi-Fi (VLAN 20)",
      cidr: "10.10.20.0/24",
      icon: Wifi,
      x: 20,
      y: 80,
      details: ["guest-laptop-1 (10.10.20.101)", "guest-phone-2 (10.10.20.102)"],
    },
    {
      id: "staff",
      title: "Staff Workstations (VLAN 10)",
      cidr: "10.10.10.0/24",
      icon: Laptop,
      x: 42,
      y: 82,
      details: ["staff-workstation-1 (10.10.10.50)", "Full internet & Intranet routing"],
    },
    {
      id: "servers",
      title: "Internal Servers (VLAN 30)",
      cidr: "10.10.30.0/24",
      icon: Server,
      x: 66,
      y: 82,
      details: ["intranet-web (10.10.30.10:80)", "db-cluster (10.10.30.20:5432)"],
    },
    {
      id: "mgmt",
      title: "Management Bastion (VLAN 100)",
      cidr: "192.168.100.0/24",
      icon: Lock,
      x: 86,
      y: 78,
      details: ["admin-bastion (192.168.100.10)", "Protected by Lockout Guard Invariant"],
    },
  ];

  const handleNodeClick = (node: any) => {
    setSelectedNode(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="neu-raised-md p-5 border border-[var(--pal-200)] relative">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--pal-200)]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--allow)]" strokeWidth={1.75} />
          <h3 className="text-sm font-bold text-[var(--ink-900)]">
            Emulated Network Topology
          </h3>
          <span className="text-[11px] font-mono text-[var(--ink-500)]">
            Mininet / Linux Namespaces Sandbox
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isSimulating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-inset text-[var(--ink-900)]">
              <span className="w-2 h-2 rounded-full bg-[var(--ink-700)] animate-ping" />
              <span>{simulationProgress || "Simulating traffic flows..."}</span>
            </div>
          )}

          {lastSimResult && !isSimulating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border border-[rgba(26,107,67,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Evidence Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport (Inset Well) */}
      <div className="relative w-full h-[360px] my-3 neu-inset rounded-2xl overflow-hidden select-none bg-[var(--surface-card)]">
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(var(--pal-300) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Floating Canvas Toolbar (Glass-Thin) */}
        <div className="absolute top-3 right-3 z-30 glass-thin p-1 rounded-xl flex items-center gap-1 border border-[var(--pal-200)] shadow-md">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            aria-label="Zoom In"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--pal-100)] cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            aria-label="Zoom Out"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--pal-100)] cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            aria-label="Reset View"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--pal-100)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setShowTableView(!showTableView)}
            aria-label="Toggle Accessibility Table View"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--pal-100)] cursor-pointer"
          >
            <List className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Floating Legend (Glass-Thin) */}
        <div className="absolute bottom-3 left-3 z-30 glass-thin px-3 py-1.5 rounded-xl border border-[var(--pal-200)] flex items-center gap-3 text-[11px] font-mono text-[var(--ink-600)] shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--allow)]" />
            <span>Allowed Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--deny)]" />
            <span>Blocked Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--pal-300)]" />
            <span>Idle Link</span>
          </div>
        </div>

        {/* Scaled Canvas Container */}
        <div
          className="w-full h-full relative transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Topology Edges */}
          <svg
            className="w-full h-full absolute inset-0 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Gateway to WAN uplink */}
            <line
              x1="50"
              y1="46"
              x2="50"
              y2="16"
              stroke="var(--pal-300)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* Guest to Gateway edge */}
            <line
              x1="22"
              y1="76"
              x2="48"
              y2="48"
              className={blockedTarget ? "packet-flow-deny" : "packet-flow-allow"}
              strokeWidth="1.2"
            />

            {/* Staff to Gateway edge (Allowed flow) */}
            <line
              x1="43"
              y1="78"
              x2="49"
              y2="48"
              className="packet-flow-allow"
              strokeWidth="1.2"
            />

            {/* Servers to Gateway edge */}
            <line
              x1="65"
              y1="78"
              x2="51"
              y2="48"
              className="packet-flow-allow"
              strokeWidth="1.2"
            />

            {/* Management to Gateway edge (Lockout Protected) */}
            <line
              x1="84"
              y1="74"
              x2="52"
              y2="48"
              stroke="var(--info)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>

          {/* Blocked Badge indicator at midpoint */}
          {blockedTarget && (
            <div className="absolute top-[32%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-25 px-2 py-0.5 rounded-lg bg-[rgba(179,38,30,0.14)] text-[var(--deny)] border border-[rgba(179,38,30,0.4)] text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
              <ShieldX className="w-3 h-3" strokeWidth={2} />
              <span>DENY: guest -&gt; {blockedTarget}</span>
            </div>
          )}

          {/* Node Elements */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            const isGuestBlocked = node.id === "guest" && Boolean(blockedTarget);

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-20 flex flex-col items-center cursor-pointer group"
              >
                {/* Node Box */}
                <div
                  className={`rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 border ${
                    node.isGateway ? "w-16 h-16" : "w-14 h-14"
                  } ${
                    isSelected
                      ? "neu-inset border-[var(--ink-900)] ring-2 ring-[var(--ink-700)] ring-offset-2 ring-offset-[var(--surface-card)]"
                      : "neu-raised-sm border-[var(--pal-200)]"
                  }`}
                  style={{ background: "var(--surface-card)" }}
                >
                  <Icon
                    className={node.isGateway ? "w-7 h-7 text-[var(--ink-900)]" : "w-6 h-6 text-[var(--ink-700)]"}
                    strokeWidth={1.75}
                  />

                  {/* Red indicator badge if target blocked */}
                  {isGuestBlocked && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--deny)] text-white flex items-center justify-center text-[10px] font-bold">
                      ✕
                    </span>
                  )}
                </div>

                {/* Node Label */}
                <div className="mt-1.5 text-center">
                  <span className="text-xs font-bold text-[var(--ink-900)] block whitespace-nowrap">
                    {node.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--ink-500)] block">
                    {node.cidr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accessible Table View Overlay (Section 13) */}
        {showTableView && (
          <div className="absolute inset-0 z-40 glass p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--pal-200)]">
              <span className="font-bold text-xs uppercase font-mono text-[var(--ink-900)]">
                Topology Entity Table (Accessible Alternative)
              </span>
              <button
                onClick={() => setShowTableView(false)}
                className="text-xs text-[var(--ink-700)] hover:underline cursor-pointer"
              >
                Close Table
              </button>
            </div>
            <table className="w-full text-left text-xs font-mono mt-3">
              <thead>
                <tr className="text-[var(--ink-500)] text-[11px] border-b border-[var(--pal-200)]">
                  <th className="py-2">Zone / Node</th>
                  <th className="py-2">CIDR / IP</th>
                  <th className="py-2">Policy Edge Status</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--pal-200)]">
                {nodes.map((n) => (
                  <tr key={n.id} className="py-2">
                    <td className="py-2 font-bold text-[var(--ink-900)]">{n.title}</td>
                    <td className="py-2 text-[var(--ink-700)]">{n.cidr}</td>
                    <td className="py-2">
                      {n.id === "guest" && blockedTarget ? (
                        <span className="text-[var(--deny)] font-bold">BLOCKED TARGET</span>
                      ) : (
                        <span className="text-[var(--allow)]">PERMITTED</span>
                      )}
                    </td>
                    <td className="py-2 text-[var(--ink-500)]">{n.details[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Node Details Bar */}
      {selectedNode && (
        <div className="mt-2 pt-3 border-t border-[var(--pal-200)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--ink-500)] font-mono text-[11px]">Selected:</span>
            <span className="font-bold text-[var(--ink-900)]">
              {nodes.find((n) => n.id === selectedNode)?.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nodes
              .find((n) => n.id === selectedNode)
              ?.details.map((detail, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded neu-inset font-mono text-[11px] text-[var(--ink-700)]"
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
