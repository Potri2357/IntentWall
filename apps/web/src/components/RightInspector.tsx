"use client";

import React, { useEffect } from "react";
import { X, Shield, Terminal, FileText, Layers } from "lucide-react";

interface RightInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEntity: {
    type: "node" | "probe" | "rule" | "policy";
    data: any;
  } | null;
}

export function RightInspector({ isOpen, onClose, selectedEntity }: RightInspectorProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen || !selectedEntity) return null;

  const { type, data } = selectedEntity;

  return (
    <aside className="fixed top-16 right-4 bottom-4 w-96 z-40 bg-[var(--surface-card)] rounded-xl p-5 border border-[var(--border)] flex flex-col justify-between shadow-2xl transition-all backdrop-blur-md">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {type === "node" && <Shield className="w-4 h-4 text-[var(--grey-1)]" strokeWidth={2} />}
            {type === "probe" && <Terminal className="w-4 h-4 text-[var(--grey-1)]" strokeWidth={2} />}
            {type === "rule" && <Layers className="w-4 h-4 text-[var(--grey-1)]" strokeWidth={2} />}
            {type === "policy" && <FileText className="w-4 h-4 text-[var(--grey-1)]" strokeWidth={2} />}
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              Inspector: {type}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Inspector"
            className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--grey-1)] hover:text-[var(--text-main)] hover:bg-[var(--surface-well)] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on selected type */}
        <div className="mt-4 space-y-4 text-xs font-mono">
          {type === "node" && (
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono">Entity Name</span>
                <span className="text-sm font-bold text-[var(--text-main)]">{data.title || data.id}</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono">Subnet Address</span>
                <span className="font-mono text-xs text-[var(--text-main)] px-2 py-0.5 rounded bg-[var(--surface-well)] border border-[var(--border)] inline-block">
                  {data.cidr || data.ip || "N/A"}
                </span>
              </div>
              {data.details && (
                <div>
                  <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono mb-1">
                    Interface &amp; Endpoints
                  </span>
                  <div className="space-y-1">
                    {data.details.map((d: string, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-[var(--surface-well)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)]">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "probe" && (
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono">Probe Name</span>
                <span className="font-bold text-xs text-[var(--text-main)]">{data.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    data.passed
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {data.passed ? "VERIFIED PASS" : "FAILED"}
                </span>
                <span className="font-mono text-[11px] text-[var(--grey-1)]">{data.latency_ms}ms</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono mb-1">
                  Executed Network Command
                </span>
                <div className="p-2 rounded bg-[var(--surface-well)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)] break-all">
                  $ {data.command}
                </div>
              </div>
              {data.evidence && (
                <div>
                  <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono mb-1">
                    Captured Probe Evidence
                  </span>
                  <pre className="p-2.5 rounded bg-[var(--surface-well)] text-[var(--text-main)] border border-[var(--border)] font-mono text-[10px] max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {data.evidence}
                  </pre>
                </div>
              )}
            </div>
          )}

          {type === "rule" && (
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[11px] text-[var(--grey-1)] uppercase block font-mono">Rule Intent</span>
                <span className="text-xs font-semibold text-[var(--text-main)]">{data.summary || data.intent_id}</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--surface-well)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)]">
                Hit counters: active | Priority: 0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--grey-1)] flex items-center justify-between">
        <span>Press Esc to close</span>
        <button
          onClick={onClose}
          className="text-[var(--text-main)] hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
