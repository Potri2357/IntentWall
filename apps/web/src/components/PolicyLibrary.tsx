"use client";

import React, { useState, useEffect } from "react";
import { listPolicies, rollbackPolicy } from "@/lib/api";
import {
  Shield,
  RotateCcw,
  Eye,
  ShieldCheck,
  Search,
  FlaskConical,
  RefreshCw,
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
      console.error("Error fetching policies:", err);
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
      console.error("Rollback failed:", err);
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
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-[var(--border)] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={2} />
            Gateway Policy Library &amp; Version History
          </h3>
          <p className="text-xs text-[var(--ink-500)] mt-0.5">
            Active and archived firewall policies stored in gateway database with live rollback capability.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-well)] text-xs w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[var(--ink-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by policy name, ID, or prompt..."
              className="bg-transparent text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none w-full font-mono text-[11px]"
            />
          </div>

          <button
            onClick={fetchPolicies}
            aria-label="Refresh policy list"
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-well)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:border-[var(--border-strong)] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="p-8 text-center text-[var(--ink-500)] text-xs font-mono">
          Loading policies from gateway database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-[var(--ink-500)] text-xs font-mono">
          No policies recorded yet. Compile and approve a policy in the Firewall Console to register.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--surface-well)] text-[var(--ink-500)] text-[11px] font-mono border-b border-[var(--border)]">
              <tr>
                <th className="py-2.5 px-4">Policy / Intent</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Versions</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-card)]">
              {filtered.map((pol) => {
                const isApplied = pol.status === "applied";
                const isRolledBack = pol.status === "rolled_back";
                const isSimulated = pol.status === "simulated";

                return (
                  <tr
                    key={pol.id}
                    onClick={() => onSelectPolicy(pol)}
                    className="hover:bg-[var(--surface-well)] transition-colors cursor-pointer"
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
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isApplied
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : isRolledBack
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : isSimulated
                            ? "bg-[var(--surface-well)] text-[var(--ink-700)] border border-[var(--border)]"
                            : "bg-[var(--surface-well)] text-[var(--ink-500)] border border-[var(--border)]"
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
                          className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-well)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {isApplied && (
                          <button
                            onClick={() => handleRollback(pol.id)}
                            disabled={rollingBack === pol.id}
                            aria-label="Roll back policy"
                            className="px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-400 hover:bg-red-100 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{rollingBack === pol.id ? "Rolling..." : "Rollback"}</span>
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
