"use client";

import React, { useState, useEffect } from "react";
import { NavigationRail } from "@/components/NavigationRail";
import { TopBar } from "@/components/TopBar";
import { RightInspector } from "@/components/RightInspector";
import { CommandPalette } from "@/components/CommandPalette";
import { PipelineStepper } from "@/components/PipelineStepper";
import { CommandCenter } from "@/components/CommandCenter";
import { IntentReviewCard } from "@/components/IntentReviewCard";
import { TopologyCanvas } from "@/components/TopologyCanvas";
import { SimulationLab } from "@/components/SimulationLab";
import { RuleDiffViewer } from "@/components/RuleDiffViewer";
import { PolicyLibrary } from "@/components/PolicyLibrary";
import { AuditTrail } from "@/components/AuditTrail";
import { NetworkInventory } from "@/components/NetworkInventory";
import { BenchmarkViewer } from "@/components/BenchmarkViewer";
import { SettingsView } from "@/components/SettingsView";
import {
  parseIntent,
  createPolicy,
  simulatePolicy,
  approvePolicy,
  FirewallIntentIR,
  ValidationReport,
  CompiledRuleset,
  ProbeResult,
  listPolicies,
} from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("command");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [inspectorEntity, setInspectorEntity] = useState<{
    type: "node" | "probe" | "rule" | "policy";
    data: any;
  } | null>(null);

  // Intentwall Pipeline State
  const [pipelineStage, setPipelineStage] = useState<
    "idle" | "understanding" | "validating" | "compiling" | "simulating" | "verified"
  >("idle");
  const [promptHistory, setPromptHistory] = useState<string[]>([
    "Block YouTube for the guest network",
    "Isolate the guest Wi-Fi from internal servers",
  ]);

  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [parsedIR, setParsedIR] = useState<FirewallIntentIR | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [providerUsed, setProviderUsed] = useState<string>("");
  const [currentPolicyId, setCurrentPolicyId] = useState<string | null>(null);
  const [compiledRules, setCompiledRules] = useState<CompiledRuleset | null>(null);
  const [simulationProbes, setSimulationProbes] = useState<ProbeResult[]>([]);
  const [policyStatus, setPolicyStatus] = useState<string>("draft");
  const [activePolicyCount, setActivePolicyCount] = useState<number>(0);

  // Loading States
  const [isParsing, setIsParsing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Keyboard shortcut for Cmd+K and '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Theme synchronization with html class
  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Initial load
  useEffect(() => {
    handleParseIntent("Block YouTube for the guest network", "auto");
    refreshPolicyCount();
  }, []);

  const refreshPolicyCount = async () => {
    try {
      const pols = await listPolicies();
      setActivePolicyCount(pols.filter((p: any) => p.status === "applied").length);
    } catch {
      // offline / initial
    }
  };

  const handleParseIntent = async (prompt: string, provider: string) => {
    setIsParsing(true);
    setCurrentPrompt(prompt);
    setPipelineStage("understanding");
    try {
      const res = await parseIntent(prompt, provider);
      setParsedIR(res.ir);
      setValidationReport(res.validation);
      setProviderUsed(res.provider_used);

      setPipelineStage("validating");
      const polRes = await createPolicy(prompt, res.ir);
      setCurrentPolicyId(polRes.policy_id);
      setCompiledRules(polRes.compiled);
      setPolicyStatus("draft");
      setSimulationProbes([]);

      setPipelineStage("compiling");

      if (!promptHistory.includes(prompt)) {
        setPromptHistory((prev) => [prompt, ...prev]);
      }
    } catch (err: any) {
      alert("Error parsing intent: " + err.message);
      setPipelineStage("idle");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSimulatePolicy = async () => {
    if (!currentPolicyId) return;
    setIsSimulating(true);
    setPipelineStage("simulating");
    setActiveTab("simulation");
    try {
      const res = await simulatePolicy(currentPolicyId);
      setSimulationProbes(res.results);
      setPolicyStatus("simulated");
      if (res.all_passed) {
        setPipelineStage("verified");
      }
    } catch (err: any) {
      alert("Simulation error: " + err.message);
      setPipelineStage("compiling");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApprovePolicy = async () => {
    if (!currentPolicyId) return;
    setIsApproving(true);
    try {
      await approvePolicy(currentPolicyId, "security-reviewer");
      setPolicyStatus("applied");
      refreshPolicyCount();
      alert("Policy Approved & Applied to Gateway Firewall. nftables stateful counters active.");
    } catch (err: any) {
      alert("Approval error: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSelectPolicyFromLibrary = (pol: any) => {
    setCurrentPolicyId(pol.id);
    setPolicyStatus(pol.status);
    if (pol.active_version) {
      setCurrentPrompt(pol.active_version.prompt);
      setParsedIR(pol.active_version.ir);
      setCompiledRules({
        nftables: pol.active_version.compiled_nft,
        iptables: pol.active_version.compiled_ipt,
        cisco_acl: pol.active_version.compiled_cisco,
        applied_rules_count: 1,
        summary: `Policy ${pol.id} (${pol.status})`,
      });
    }
    setActiveTab("diff");
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--ink-700)] selection:bg-[var(--pal-300)]">
      {/* 1. Left Rail (72px collapsed) */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        policyCount={activePolicyCount}
      />

      {/* 2. Main Content Area (Offset for Rail) */}
      <div className="flex-1 flex flex-col pl-[72px] min-h-screen">
        {/* Sticky Top Bar (Glass-Thin) */}
        <TopBar
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          policyId={currentPolicyId}
        />

        {/* Main Body Grid */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12 space-y-6">
          {/* Pipeline Stepper (Visible during or after compilation) */}
          {pipelineStage !== "idle" && (
            <PipelineStepper currentStage={pipelineStage} />
          )}

          {/* TAB 1: COMMAND CENTER */}
          {activeTab === "command" && (
            <div className="space-y-6">
              <CommandCenter
                onParseIntent={handleParseIntent}
                isParsing={isParsing}
                history={promptHistory}
              />

              {parsedIR && validationReport && (
                <IntentReviewCard
                  ir={parsedIR}
                  validation={validationReport}
                  providerUsed={providerUsed}
                  onSimulate={handleSimulatePolicy}
                  isSimulating={isSimulating}
                />
              )}

              <TopologyCanvas
                blockedTarget={parsedIR?.destination.ref}
                isSimulating={isSimulating}
                lastSimResult={
                  simulationProbes.length > 0
                    ? {
                        passed: simulationProbes.every((p) => p.passed),
                        all_passed: simulationProbes.every((p) => p.passed),
                      }
                    : undefined
                }
                onSelectNode={(node) => setInspectorEntity({ type: "node", data: node })}
              />
            </div>
          )}

          {/* TAB 2: SIMULATION LAB */}
          {activeTab === "simulation" && (
            <div className="space-y-6">
              <TopologyCanvas
                blockedTarget={parsedIR?.destination.ref}
                isSimulating={isSimulating}
                lastSimResult={
                  simulationProbes.length > 0
                    ? {
                        passed: simulationProbes.every((p) => p.passed),
                        all_passed: simulationProbes.every((p) => p.passed),
                      }
                    : undefined
                }
                onSelectNode={(node) => setInspectorEntity({ type: "node", data: node })}
              />

              <SimulationLab
                probes={simulationProbes}
                isSimulating={isSimulating}
                onApprove={handleApprovePolicy}
                isApproving={isApproving}
                appliedStatus={policyStatus}
                onViewDiff={() => setActiveTab("diff")}
                onSelectProbeForInspector={(probe) =>
                  setInspectorEntity({ type: "probe", data: probe })
                }
              />
            </div>
          )}

          {/* TAB 3: RULE DIFF VIEWER */}
          {activeTab === "diff" && (
            <RuleDiffViewer compiled={compiledRules} policyId={currentPolicyId || undefined} />
          )}

          {/* TAB 4: POLICY LIBRARY */}
          {activeTab === "policies" && (
            <PolicyLibrary onSelectPolicy={handleSelectPolicyFromLibrary} />
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <AuditTrail
              onSelectEventForInspector={(ev) =>
                setInspectorEntity({ type: "policy", data: ev })
              }
            />
          )}

          {/* TAB 6: NETWORK & SERVICES */}
          {activeTab === "inventory" && <NetworkInventory />}

          {/* TAB 7: BENCHMARK 100 */}
          {activeTab === "benchmark" && <BenchmarkViewer />}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <SettingsView
              isDarkMode={isDarkMode}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--pal-200)] py-3 px-6 text-center text-xs text-[var(--ink-500)] font-mono">
          Intentwall • Soft Graphite UI • Ground is Neumorphic, Air is Glass • Free Tier & Open Source
        </footer>
      </div>

      {/* 3. Floating Right Inspector (Glass) */}
      <RightInspector
        isOpen={Boolean(inspectorEntity)}
        onClose={() => setInspectorEntity(null)}
        selectedEntity={inspectorEntity}
      />

      {/* 4. Command Palette Dialog (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectPrompt={(pr) => handleParseIntent(pr, "auto")}
      />
    </div>
  );
}
