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
    <div className="neu-raised-md p-6 border border-[var(--pal-200)] space-y-6 max-w-4xl">
      <div className="pb-3 border-b border-[var(--pal-200)]">
        <h3 className="text-sm font-bold text-[var(--ink-900)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
          System & Engine Settings
        </h3>
        <p className="text-xs text-[var(--ink-500)] mt-0.5">
          Configure LLM inference gateways, safety invariants, and accessibility preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Provider Section */}
        <div className="neu-raised-sm p-4 border border-[var(--pal-200)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--pal-200)]">
            <Cpu className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Model Gateways & API Keys
            </h4>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Google Gemini API Key (Free Tier)
            </label>
            <div className="flex items-center gap-2 neu-inset px-3 py-2 rounded-xl">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server environment)"
                className="w-full bg-transparent text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[var(--ink-500)] hover:text-[var(--ink-900)] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--ink-500)] mt-1 block">
              Google AI Studio free tier key. Never transmitted to third parties or browser storage.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Local Ollama Endpoint (Offline Fallback)
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full neu-inset px-3 py-2 rounded-xl text-xs text-[var(--ink-900)] font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Safety & Invariant Rules */}
        <div className="neu-raised-sm p-4 border border-[var(--pal-200)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--pal-200)]">
            <Shield className="w-4 h-4 text-[var(--ink-700)]" strokeWidth={1.75} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              Safety Guard & Lockout Invariants
            </h4>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Management Plane Protected Invariants
            </label>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[var(--ink-700)] space-y-1">
              <div>• SSH Terminal Port: TCP 22 (Always Permitted to Mgmt)</div>
              <div>• Gateway Controller API: TCP 8000 (Protected Invariant)</div>
              <div>• Core DNS Resolution: UDP 53 (Always Permitted to Gateway)</div>
              <div>• DHCP Protocol: UDP 67/68</div>
              <div>• Management Subnet: 192.168.100.0/24 (Lockout Blocked)</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-700)] block mb-1">
              Auto-Rollback Safety Timer (Seconds)
            </label>
            <input
              type="number"
              value={autoRollbackSec}
              onChange={(e) => setAutoRollbackSec(Number(e.target.value))}
              className="w-32 neu-inset px-3 py-1.5 rounded-xl text-xs text-[var(--ink-900)] font-mono focus:outline-none"
            />
            <span className="text-[11px] text-[var(--ink-500)] ml-2 font-mono">
              Reverts live gateway changes if operator confirmation expires.
            </span>
          </div>
        </div>

        {/* Appearance & Accessibility Section */}
        <div className="neu-raised-sm p-4 border border-[var(--pal-200)] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-900)] pb-2 border-b border-[var(--pal-200)]">
            Appearance & Accessibility
          </h4>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[var(--ink-900)] block">Interface Theme</span>
              <span className="text-[11px] text-[var(--ink-500)]">
                Soft Graphite neumorphism (Ground) & Glassmorphism (Air)
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="neu-raised-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? "Dark Theme" : "Light Theme"}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-graphite-primary px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-[var(--allow)]" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Settings Saved" : "Save Preferences"}</span>
        </button>
      </form>
    </div>
  );
}
