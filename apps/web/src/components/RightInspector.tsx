"use client";

import React, { useEffect } from "react";
import { X, Shield, Terminal, Activity, FileText, CheckCircle, Ban, Layers } from "lucide-react";

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
    <aside
      className="fixed top-16 right-4 bottom-4 w-90 z-40 glass rounded-2xl p-5 border border-[var(--pal-200)] flex flex-col justify-between shadow-2xl transition-all animate-in slide-in-from-right duration-200"
      style={{
        backdropFilter: "blur(18px)",
      }}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--pal-200)]">
          <div className="flex items-center gap-2">
            {type === "node" && <Shield className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />}
            {type === "probe" && <Terminal className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />}
            {type === "rule" && <Layers className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />}
            {type === "policy" && <FileText className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />}
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Inspector: {type}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Inspector"
            className="w-7 h-7 rounded-lg neu-raised-sm flex items-center justify-center text-[var(--ink-600)] hover:text-[var(--ink-900)] cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content based on selected type */}
        <div className="mt-4 space-y-4 text-xs font-mono">
          {type === "node" && (
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono">Node Label</span>
                <span className="text-sm font-bold text-[var(--ink-900)]">{data.title || data.id}</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono">Subnet / Address</span>
                <span className="font-mono text-xs text-[var(--ink-700)] px-2 py-0.5 rounded neu-inset inline-block">
                  {data.cidr || data.ip || "N/A"}
                </span>
              </div>
              {data.details && (
                <div>
                  <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono mb-1">
                    Interface & Endpoints
                  </span>
                  <div className="space-y-1">
                    {data.details.map((d: string, idx: number) => (
                      <div key={idx} className="p-1.5 rounded neu-inset font-mono text-[11px] text-[var(--ink-700)]">
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
                <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono">Probe Identifier</span>
                <span className="font-bold text-xs text-[var(--ink-900)]">{data.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    data.passed
                      ? "bg-[rgba(26,107,67,0.12)] text-[var(--allow)]"
                      : "bg-[rgba(179,38,30,0.12)] text-[var(--deny)]"
                  }`}
                >
                  {data.passed ? "VERIFIED PASS" : "FAILED"}
                </span>
                <span className="font-mono text-[11px] text-[var(--ink-500)]">{data.latency_ms}ms</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono mb-1">
                  Raw Command Evidence
                </span>
                <div className="p-2.5 rounded neu-inset font-mono text-[11px] text-[var(--ink-900)] break-all">
                  $ {data.command}
                </div>
              </div>
              {data.evidence && (
                <div>
                  <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono mb-1">
                    Captured Output
                  </span>
                  <pre className="p-2.5 rounded neu-inset font-mono text-[10px] text-[var(--ink-700)] max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {data.evidence}
                  </pre>
                </div>
              )}
            </div>
          )}

          {type === "rule" && (
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[11px] text-[var(--ink-500)] uppercase block font-mono">Rule Intent</span>
                <span className="text-xs font-semibold text-[var(--ink-900)]">{data.summary || data.intent_id}</span>
              </div>
              <div className="p-2.5 rounded neu-inset font-mono text-[11px] text-[var(--ink-700)]">
                Hit counters: active | Priority: 0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[var(--pal-200)] text-[11px] text-[var(--ink-500)] flex items-center justify-between">
        <span>Press Esc to close</span>
        <button
          onClick={onClose}
          className="text-[var(--ink-700)] hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
