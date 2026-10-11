"use client";

import React, { useState } from "react";
import { Settings, Cpu, Shield, Eye, EyeOff, Save, Check, Sun, Moon } from "lucide-react";

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function SettingsView({ isDarkMode, onToggleTheme }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [autoRollbackSec, setAutoRollbackSec] = useState(60);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-5 max-w-4xl transition-colors">
      <div className="pb-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={2} />
          System &amp; Firewall Engine Configuration
        </h3>
        <p className="text-xs text-[var(--ink-500)] mt-0.5">
          Configure inference engines, network safety invariants, and administrative preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Model Provider Section */}
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface-well)] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Cpu className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              LLM Inference Engine &amp; API Keys
            </h4>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Google Gemini API Key
            </label>
            <div className="flex items-center gap-2 bg-[var(--surface-card)] border border-[var(--border)] px-3 py-2 rounded-xl">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server environment key)"
                className="w-full bg-transparent text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[var(--ink-400)] hover:text-[var(--ink-900)] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--ink-500)] mt-1 block">
              Used for understanding complex natural language intents. Falls back to local deterministic compiler when offline.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Local Ollama Server Endpoint
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full bg-[var(--surface-card)] border border-[var(--border)] px-3 py-2 rounded-xl text-xs text-[var(--ink-900)] font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Safety & Invariant Rules */}
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface-well)] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Shield className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Network Safety Guard &amp; Lockout Invariants
            </h4>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Protected Invariants (RFC Standards &amp; Gateway Connectivity)
            </label>
            <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] text-xs font-mono text-[var(--ink-700)] space-y-1">
              <div>[LOCKOUT-1] SSH Port: TCP 22 (Always Allowed to Gateway from Mgmt)</div>
              <div>[LOCKOUT-2] Controller API: TCP 8000 (Required for Management)</div>
              <div>[LOCKOUT-3] DNS Resolution: UDP 53 (Preserved for Internal Resolver)</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Dead-Man's Timer Rollback Window (Seconds)
            </label>
            <input
              type="number"
              value={autoRollbackSec}
              onChange={(e) => setAutoRollbackSec(Number(e.target.value))}
              className="w-48 bg-[var(--surface-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl text-xs text-[var(--ink-900)] font-mono focus:outline-none"
            />
            <span className="text-[11px] text-[var(--ink-500)] mt-1 block">
              Auto-reverts firewall rules if connectivity confirmation is not acknowledged within this window.
            </span>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface-well)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
                Interface Color Scheme
              </h4>
              <p className="text-[11px] text-[var(--ink-500)] mt-0.5">
                Neutral 5-step grey &amp; graphite engineering palette.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] font-medium flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-[var(--ink-900)] text-[var(--bg)] hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save System Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
