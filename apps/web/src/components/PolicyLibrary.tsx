"use client";

import React, { useState, useEffect } from "react";
import { listPolicies, rollbackPolicy } from "@/lib/api";
import {
  Shield,
  RotateCcw,
  Eye,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  FlaskConical,
  CircleX,
} from "lucide-react";

interface PolicyLibraryProps {
  onSelectPolicy: (policy: any) => void;
}

export function PolicyLibrary({ onSelectPolicy }: PolicyLibraryProps) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      const data = await listPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleRollback = async (policyId: string) => {
    setRollingBack(policyId);
    try {
      await rollbackPolicy(policyId, "admin-reviewer");
      await fetchPolicies();
    } catch (err) {
      alert("Rollback failed: " + err);
    } finally {
      setRollingBack(null);
    }
  };

  const filtered = policies.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.active_version?.prompt && p.active_version.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--pal-200)] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            Policy Library & Version Control
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Immutable versioned policies with one-click live rollback capability.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-inset text-xs w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[var(--ink-500)]" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies by name, ID or prompt..."
              className="bg-transparent text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none w-full"
            />
          </div>

          <button
            onClick={fetchPolicies}
            aria-label="Refresh policy list"
            className="neu-raised-sm px-3 py-1.5 rounded-xl text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] cursor-pointer shrink-0"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          Loading policies...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-[var(--ink-500)] text-xs font-mono">
          No policies matching search. Compile an intent from the Command Center to add.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--pal-200)] overflow-hidden">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--surface-card)] text-[var(--ink-500)] text-[11px] font-mono border-b border-[var(--pal-200)]">
              <tr>
                <th className="py-2.5 px-4">Policy / Prompt</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Versions</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pal-200)] bg-[var(--surface-card)]">
              {filtered.map((pol) => {
                const isApplied = pol.status === "applied";
                const isRolledBack = pol.status === "rolled_back";
                const isSimulated = pol.status === "simulated";

                return (
                  <tr
                    key={pol.id}
                    onClick={() => onSelectPolicy(pol)}
                    className="hover:bg-[var(--pal-50)] transition-colors cursor-pointer"
                  >
                    {/* Name & Prompt */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[var(--ink-900)] block">{pol.name}</span>
                      <span className="text-[11px] font-mono text-[var(--ink-500)] truncate max-w-md block">
                        {pol.active_version?.prompt || pol.id}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isApplied
                            ? "bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border border-[rgba(26,107,67,0.3)]"
                            : isRolledBack
                            ? "bg-[rgba(138,90,0,0.12)] text-[var(--warn)] border border-[rgba(138,90,0,0.3)]"
                            : isSimulated
                            ? "bg-[rgba(47,93,158,0.12)] text-[var(--info)] border border-[rgba(47,93,158,0.3)]"
                            : "neu-raised-sm text-[var(--ink-500)]"
                        }`}
                      >
                        {isApplied ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : isSimulated ? (
                          <FlaskConical className="w-3 h-3" />
                        ) : isRolledBack ? (
                          <RotateCcw className="w-3 h-3" />
                        ) : null}
                        <span>{pol.status}</span>
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-700)]">
                      {pol.active_version ? `${pol.active_version.risk_score}/100` : "-"}
                    </td>

                    {/* Versions Count */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-500)]">
                      {pol.versions_count || 1}
                    </td>

                    {/* Updated Time */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-500)]">
                      {new Date(pol.updated_at).toLocaleTimeString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectPolicy(pol)}
                          aria-label="Inspect policy"
                          className="neu-raised-sm px-2.5 py-1 rounded-lg text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {isApplied && (
                          <button
                            onClick={() => handleRollback(pol.id)}
                            disabled={rollingBack === pol.id}
                            aria-label="Roll back policy"
                            className="neu-raised-sm px-2.5 py-1 rounded-lg text-xs text-[var(--deny)] hover:bg-[rgba(179,38,30,0.1)] border border-[rgba(179,38,30,0.3)] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{rollingBack === pol.id ? "Rolling back..." : "Roll Back"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
