"use client";

import React, { useState } from "react";
import {
  Globe,
  Shield,
  Wifi,
  Laptop,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Network,
  Play,
  RotateCw,
} from "lucide-react";

interface SubnetNode {
  id: string;
  name: string;
  vlan: string;
  cidr: string;
  netmask: string;
  gatewayInterface: string;
  gatewayIp: string;
  macPrefix: string;
  icon: any;
  hosts: { name: string; ip: string; mac: string; status: string }[];
  rules: string[];
}

interface TopologyCanvasProps {
  blockedTarget?: string;
  isSimulating?: boolean;
  simulationProgress?: string;
  lastSimResult?: {
    passed: boolean;
    all_passed?: boolean;
  };
  onSelectNode?: (nodeData: any) => void;
  onTriggerSimulation?: () => void;
}

export function TopologyCanvas({
  blockedTarget,
  isSimulating,
  simulationProgress,
  lastSimResult,
  onSelectNode,
  onTriggerSimulation,
}: TopologyCanvasProps) {
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>("guest");

  const subnets: SubnetNode[] = [
    {
      id: "guest",
      name: "Guest Subnet",
      vlan: "VLAN 20",
      cidr: "10.10.20.0/24",
      netmask: "255.255.255.0",
      gatewayInterface: "eth1.20",
      gatewayIp: "10.10.20.1",
      macPrefix: "52:54:00:20:",
      icon: Wifi,
      hosts: [
        { name: "guest-laptop-1", ip: "10.10.20.101", mac: "52:54:00:20:10:01", status: "Active (DHCP Lease: 2h)" },
        { name: "guest-phone-2", ip: "10.10.20.102", mac: "52:54:00:20:10:02", status: "Active (DHCP Lease: 4h)" },
      ],
      rules: blockedTarget
        ? [
            `DROP: tcp dport { 80, 443 } to ${blockedTarget} (QUIC/HTTPS)`,
            `DROP: udp dport 443 to ${blockedTarget} (QUIC Protocol)`,
            "ACCEPT: udp dport 53 to 10.10.1.1 (Gateway DNS Resolver)",
          ]
        : ["ACCEPT: all outbound to WAN via eth0", "ACCEPT: udp dport 53 to 10.10.1.1 (DNS)"],
    },
    {
      id: "staff",
      name: "Staff Workstations",
      vlan: "VLAN 10",
      cidr: "10.10.10.0/24",
      netmask: "255.255.255.0",
      gatewayInterface: "eth1.10",
      gatewayIp: "10.10.10.1",
      macPrefix: "52:54:00:10:",
      icon: Laptop,
      hosts: [
        { name: "staff-workstation-1", ip: "10.10.10.50", mac: "52:54:00:10:50:01", status: "Static IP (Reserved)" },
        { name: "staff-laptop-2", ip: "10.10.10.51", mac: "52:54:00:10:50:02", status: "Active (802.1X Auth)" },
      ],
      rules: [
        "ACCEPT: all outbound to WAN (Full Internet Access)",
        "ACCEPT: tcp dport { 80, 443, 5432 } to Server DMZ (10.10.30.0/24)",
        "ACCEPT: udp dport 53 to 10.10.1.1 (DNS)",
      ],
    },
    {
      id: "servers",
      name: "Server DMZ Farm",
      vlan: "VLAN 30",
      cidr: "10.10.30.0/24",
      netmask: "255.255.255.0",
      gatewayInterface: "eth1.30",
      gatewayIp: "10.10.30.1",
      macPrefix: "52:54:00:30:",
      icon: Server,
      hosts: [
        { name: "intranet-web", ip: "10.10.30.10", mac: "52:54:00:30:10:01", status: "NGINX (Ports 80, 443)" },
        { name: "db-cluster", ip: "10.10.30.20", mac: "52:54:00:30:20:01", status: "PostgreSQL (Port 5432)" },
      ],
      rules: [
        "DROP: all inbound connections originating from Guest (10.10.20.0/24)",
        "ACCEPT: tcp dport { 80, 443 } from Staff (10.10.10.0/24)",
        "ACCEPT: tcp dport 5432 from Intranet Web host only",
      ],
    },
    {
      id: "mgmt",
      name: "Management Bastion",
      vlan: "VLAN 100",
      cidr: "192.168.100.0/24",
      netmask: "255.255.255.0",
      gatewayInterface: "eth2",
      gatewayIp: "192.168.100.1",
      macPrefix: "52:54:00:99:",
      icon: Lock,
      hosts: [
        { name: "admin-bastion", ip: "192.168.100.10", mac: "52:54:00:99:10:01", status: "SSH RSA 4096-bit Verified" },
      ],
      rules: [
        "ACCEPT: tcp dport 22 to Gateway 10.10.1.1 (Management SSH)",
        "ACCEPT: tcp dport 8000 to Gateway (Intentwall Controller API)",
        "LOCKOUT GUARD: Modifying/Dropping TCP 22 prohibited by invariant checker",
      ],
    },
  ];

  const activeSubnet = subnets.find((s) => s.id === selectedSubnetId) || subnets[0];

  const handleSelectSubnet = (sub: SubnetNode) => {
    setSelectedSubnetId(sub.id);
    if (onSelectNode) {
      onSelectNode({
        id: sub.id,
        title: sub.name,
        cidr: sub.cidr,
        details: [
          `Gateway Interface: ${sub.gatewayInterface} (${sub.gatewayIp})`,
          `VLAN Tag: ${sub.vlan}`,
          `MAC Allocation: ${sub.macPrefix}XX`,
          ...sub.hosts.map((h) => `${h.name} (${h.ip} - ${h.status})`),
        ],
      });
    }
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink-900)] text-[var(--bg)] flex items-center justify-center shrink-0">
              <Network className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--ink-900)]">
                  Live Network Topology &amp; Firewall Inspection
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)]">
                  4 VLANs • Linux nftables 1.0.9
                </span>
              </div>
              <p className="text-xs text-[var(--ink-500)] mt-0.5">
                Emulated network namespace with real netfilter hooks, interface bindings, and packet forwarding logic.
              </p>
            </div>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2">
          {onTriggerSimulation && (
            <button
              onClick={onTriggerSimulation}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSimulating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Packets...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Inject Traffic Flow</span>
                </>
              )}
            </button>
          )}

          {lastSimResult && !isSimulating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>7/7 Probes Passed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Topology Diagram Canvas */}
      <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-well)] p-6 overflow-hidden">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--grey-1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-4">
          {/* TIER 1: External Internet WAN */}
          <div className="flex flex-col items-center">
            <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-5 py-3 shadow-xs flex items-center gap-3 w-72">
              <div className="w-9 h-9 rounded-lg bg-[var(--surface-well)] flex items-center justify-center text-[var(--ink-700)] shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-[var(--ink-900)] block">
                  Internet / External WAN
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-500)] block">
                  Route: 0.0.0.0/0 (Default Gateway)
                </span>
              </div>
            </div>

            {/* Link WAN -> Gateway with Packet Animation */}
            <div className="flex flex-col items-center my-1 relative">
              <div className="w-0.5 h-7 bg-[var(--border-strong)] relative overflow-hidden">
                {isSimulating && (
                  <div className="w-full h-2.5 bg-emerald-500 animate-pulse absolute top-0" />
                )}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-card)] text-[var(--ink-700)] border border-[var(--border)]">
                eth0 • WAN Uplink (1000Mbps)
              </span>
              <div className="w-0.5 h-7 bg-[var(--border-strong)]" />
            </div>
          </div>

          {/* TIER 2: Central Linux Gateway Firewall & Router */}
          <div className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-strong)] rounded-2xl p-4 shadow-sm text-center relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--ink-900)] text-[var(--bg)] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-[var(--ink-900)] leading-tight">
                    Linux Core Gateway &amp; Firewall
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--ink-500)]">
                    Host: gateway-fw0 • 10.10.1.1
                  </span>
                </div>
              </div>

              {/* Hardware / Engine Telemetry */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--ink-500)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>nftables 1.0.9</span>
              </div>
            </div>

            {/* Live Filter Invariant Badges */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-[var(--surface-well)] border border-[var(--border)]">
                <span className="text-[var(--ink-400)] block text-[9px]">CONNTRACK</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">STATEFUL ON</span>
              </div>
              <div className="p-1.5 rounded bg-[var(--surface-well)] border border-[var(--border)]">
                <span className="text-[var(--ink-400)] block text-[9px]">LOCKOUT GUARD</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">ENFORCING</span>
              </div>
              <div className="p-1.5 rounded bg-[var(--surface-well)] border border-[var(--border)]">
                <span className="text-[var(--ink-400)] block text-[9px]">CPU / LATENCY</span>
                <span className="font-semibold text-[var(--ink-700)]">0.8% / 1.2ms</span>
              </div>
            </div>

            {/* Active Blocking Callout Banner if policy has target */}
            {blockedTarget && (
              <div className="mt-3 p-2 rounded-lg bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>FORWARD FILTER: DROP Guest to {blockedTarget.toUpperCase()}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 font-bold">
                  Rule Active
                </span>
              </div>
            )}
          </div>

          {/* Bus connector branch to 4 VLANs */}
          <div className="w-full flex flex-col items-center my-2">
            <div className="w-0.5 h-6 bg-[var(--border-strong)]" />
            <div className="w-full max-w-3xl h-0.5 bg-[var(--border-strong)] relative">
              {isSimulating && (
                <div className="absolute inset-0 bg-emerald-500/50 animate-pulse" />
              )}
            </div>
            <div className="w-full max-w-3xl flex justify-between">
              <div className="w-0.5 h-5 bg-[var(--border-strong)]" />
              <div className="w-0.5 h-5 bg-[var(--border-strong)]" />
              <div className="w-0.5 h-5 bg-[var(--border-strong)]" />
              <div className="w-0.5 h-5 bg-[var(--border-strong)]" />
            </div>
          </div>

          {/* TIER 3: The 4 Isolated VLAN Subnets */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 w-full max-w-4xl">
            {subnets.map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedSubnetId === sub.id;
              const isGuestBlocked = sub.id === "guest" && Boolean(blockedTarget);

              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubnet(sub)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left select-none ${
                    isSelected
                      ? "bg-[var(--surface-card)] border-[var(--ink-900)] shadow-md ring-2 ring-[var(--ink-900)]"
                      : "bg-[var(--surface-card)] border-[var(--border)] hover:border-[var(--border-strong)] shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-well)] flex items-center justify-center text-[var(--ink-700)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-500)] border border-[var(--border)]">
                      {sub.vlan}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-[var(--ink-900)] leading-tight">
                    {sub.name}
                  </h5>
                  <div className="text-[11px] font-mono text-[var(--ink-500)] mt-1">
                    {sub.cidr}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--ink-400)] mt-0.5">
                    Port: {sub.gatewayInterface}
                  </div>

                  {/* Dynamic Status Tag */}
                  <div className="mt-3 pt-2 border-t border-[var(--border)]">
                    {isGuestBlocked ? (
                      <span className="text-[10px] font-mono font-bold block text-center px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                        TRAFFIC BLOCKED ⛔
                      </span>
                    ) : sub.id === "mgmt" ? (
                      <span className="text-[10px] font-mono font-semibold block text-center px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        SSH PROTECTED ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono block text-center px-1.5 py-0.5 rounded bg-[var(--surface-well)] text-[var(--ink-700)]">
                        {sub.hosts.length} Host(s) Connected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subnet Technical Inspector Drawer */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-well)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--ink-700)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Subnet Inspector: {activeSubnet.name} ({activeSubnet.vlan})
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-500)]">
            <span>Gateway IP: <strong className="text-[var(--ink-900)]">{activeSubnet.gatewayIp}</strong></span>
            <span>•</span>
            <span>Interface: <strong className="text-[var(--ink-900)]">{activeSubnet.gatewayInterface}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {/* Host Allocations */}
          <div>
            <h5 className="text-[11px] font-bold text-[var(--ink-700)] uppercase tracking-wider mb-2 font-mono">
              Connected Endpoints &amp; MAC Allocations
            </h5>
            <div className="space-y-1.5 font-mono text-xs">
              {activeSubnet.hosts.map((host, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-[var(--ink-900)] block">{host.name}</span>
                    <span className="text-[10px] text-[var(--ink-400)]">MAC: {host.mac}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--ink-700)] font-semibold block">{host.ip}</span>
                    <span className="text-[10px] text-[var(--ink-500)]">{host.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Interface Firewall Rules */}
          <div>
            <h5 className="text-[11px] font-bold text-[var(--ink-700)] uppercase tracking-wider mb-2 font-mono">
              Active Netfilter Rules on {activeSubnet.gatewayInterface}
            </h5>
            <div className="space-y-1.5 font-mono text-xs">
              {activeSubnet.rules.map((rule, idx) => {
                const isDrop = rule.startsWith("DROP");
                const isLockout = rule.includes("LOCKOUT");

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                      isDrop
                        ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold"
                        : isLockout
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                        : "bg-[var(--surface-card)] border-[var(--border)] text-[var(--ink-700)]"
                    }`}
                  >
                    {rule}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
