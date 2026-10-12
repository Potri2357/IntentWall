"use client";

import React, { useState, useEffect } from "react";
import { getNetworkInventory } from "@/lib/api";
import { Network, Server, Globe, Wifi, Laptop, Lock } from "lucide-react";

export function NetworkInventory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetworkInventory()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">Loading network inventory from gateway...</div>;
  }

  const zones = data?.zones || {};
  const services = data?.services || {};

  const getZoneIcon = (role: string) => {
    switch (role) {
      case "guest":
        return Wifi;
      case "staff":
        return Laptop;
      case "server":
        return Server;
      case "mgmt":
        return Lock;
      default:
        return Globe;
    }
  };

  return (
    <div className="space-y-5">
      {/* Configured Zones Section */}
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="pb-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Network className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={2} />
            Subnets, VLANs &amp; Gateway Interfaces
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Network interfaces and routing boundaries configured on the Linux firewall gateway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.entries(zones).map(([key, zone]: [string, any]) => {
            const Icon = getZoneIcon(zone.role);
            return (
              <div
                key={key}
                className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border)] space-y-2 shadow-xs hover:border-[var(--border-strong)] hover:bg-[var(--surface-well)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
                    <span className="font-bold text-xs text-[var(--ink-900)]">{zone.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)] text-[var(--ink-700)]">
                    VLAN {zone.vlan}
                  </span>
                </div>

                <div className="text-xs font-mono text-[var(--ink-700)] flex items-center justify-between pt-1">
                  <span>CIDR: {zone.cidr}</span>
                  <span>GW: {zone.gateway}</span>
                </div>

                <div className="text-[11px] font-mono text-[var(--ink-500)] pt-1.5 border-t border-[var(--border)]">
                  Interface: <span className="text-[var(--ink-900)] font-semibold">{zone.interface}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Catalog Section */}
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="pb-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={2} />
            Service Catalog &amp; Port Mappings
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Application protocol mappings, destination ports, and QUIC (UDP/443) firewall drop sets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.entries(services).map(([key, svc]: [string, any]) => (
            <div
              key={key}
              className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border)] space-y-2 shadow-xs hover:border-[var(--border-strong)] hover:bg-[var(--surface-well)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[var(--ink-900)] uppercase font-mono">{svc.name || key}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)] text-[var(--ink-700)] truncate max-w-[160px]" title={svc.description}>
                  {svc.category || svc.description}
                </span>
              </div>

              <div className="pt-1 flex flex-wrap gap-1 font-mono text-[11px]">
                {svc.ports?.map((p: any, idx: number) => {
                  const portStr = typeof p === "object" && p !== null ? p.port : p;
                  const protoStr = typeof p === "object" && p !== null && p?.proto
                    ? String(p.proto).toUpperCase()
                    : Array.isArray(svc.protocols)
                    ? svc.protocols.map((pr: any) => String(pr).toUpperCase()).join("/")
                    : "TCP";
                  return (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)] text-[var(--ink-700)] font-medium"
                    >
                      {protoStr}/{portStr}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
