"use client";

import React, { useState, useEffect } from "react";
import { getNetworkInventory } from "@/lib/api";
import { Network, Server, Globe, Shield, Wifi, Laptop, Lock } from "lucide-react";

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
    return <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">Loading inventory...</div>;
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
    <div className="space-y-6">
      {/* Configured Zones Section */}
      <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-4">
        <div className="pb-3 border-b border-[var(--pal-200)]">
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Network className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            Network Zones, Subnets & VLANs
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Network entities referenced during LLM entity resolution and firewall rule compilation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(zones).map(([key, zone]: [string, any]) => {
            const Icon = getZoneIcon(zone.role);
            return (
              <div
                key={key}
                className="neu-raised-sm p-4 border border-[var(--pal-200)] space-y-2 hover:neu-inset transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
                    <span className="font-bold text-sm text-[var(--ink-900)]">{zone.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded neu-inset text-[var(--ink-600)]">
                    VLAN {zone.vlan}
                  </span>
                </div>

                <div className="text-xs font-mono text-[var(--ink-700)] flex items-center justify-between pt-1">
                  <span>CIDR: {zone.cidr}</span>
                  <span>GW: {zone.gateway}</span>
                </div>

                <div className="text-[11px] font-mono text-[var(--ink-500)] pt-1 border-t border-[var(--pal-200)]">
                  Interface: <span className="text-[var(--ink-900)]">{zone.interface}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Catalog Section */}
      <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-4">
        <div className="pb-3 border-b border-[var(--pal-200)]">
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            Service Catalog & Layered Application Definitions
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Maps service names to dynamic domains, ports, and QUIC (UDP/443) bypass protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(services).map(([key, svc]: [string, any]) => (
            <div
              key={key}
              className="neu-raised-sm p-4 border border-[var(--pal-200)] space-y-2.5 hover:neu-inset transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--ink-900)]">{svc.name}</span>
                {svc.quic_relevant && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[rgba(179,38,30,0.12)] text-[var(--deny)] border border-[rgba(179,38,30,0.3)]">
                    QUIC Protected
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--ink-500)] line-clamp-1">{svc.description}</p>

              <div>
                <span className="text-[10px] text-[var(--ink-500)] font-mono block mb-1">Domains:</span>
                <div className="flex flex-wrap gap-1">
                  {svc.domains.slice(0, 3).map((d: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded neu-inset text-[10px] font-mono text-[var(--ink-700)]"
                    >
                      {d}
                    </span>
                  ))}
                  {svc.domains.length > 3 && (
                    <span className="text-[10px] font-mono text-[var(--ink-500)] self-center">
                      +{svc.domains.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--pal-200)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-500)]">
                <span>Ports: {svc.ports.join(", ")}</span>
                <span>Protos: {svc.protocols.join(", ").toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
