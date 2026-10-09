"use client";

import React, { useState, useEffect } from "react";
import { getNetworkInventory } from "@/lib/api";
import { Database, Globe, Shield, Radio, Check, Server } from "lucide-react";

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
    return <div className="p-8 text-center text-slate-500 text-xs">Loading network inventory...</div>;
  }

  const zones = data?.zones || {};
  const services = data?.services || {};

  return (
    <div className="space-y-6">
      {/* Zones Section */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Configured Network Zones & VLANs
          </h3>
          <p className="text-xs text-slate-400">
            Network entities referenced during LLM entity resolution and firewall rule compilation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(zones).map(([key, zone]: [string, any]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{zone.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {key}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>CIDR: {zone.cidr}</span>
                <span>VLAN: {zone.vlan}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Interface: <span className="text-indigo-300">{zone.interface}</span> | Gateway: {zone.gateway}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Catalog Section */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Service Catalog & Layered Application Definitions
          </h3>
          <p className="text-xs text-slate-400">
            Maps service names to dynamic domains, ports, and QUIC (UDP/443) bypass protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(services).map(([key, svc]: [string, any]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{svc.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {svc.category}
                  </span>
                </div>
                {svc.quic_relevant && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-red-500/10 text-red-300 border border-red-500/30">
                    QUIC Protected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-1">{svc.description}</p>

              <div>
                <span className="text-[11px] text-slate-500 font-mono block mb-1">Domains:</span>
                <div className="flex flex-wrap gap-1">
                  {svc.domains.slice(0, 3).map((d: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 text-[10px] font-mono"
                    >
                      {d}
                    </span>
                  ))}
                  {svc.domains.length > 3 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{svc.domains.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
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
