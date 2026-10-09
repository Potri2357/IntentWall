"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CommandCenter } from "@/components/CommandCenter";
import { IntentReviewCard } from "@/components/IntentReviewCard";
import { TopologyMap } from "@/components/TopologyMap";
import { SimulationLab } from "@/components/SimulationLab";
import { RuleDiffViewer } from "@/components/RuleDiffViewer";
import { PolicyLibrary } from "@/components/PolicyLibrary";
import { AuditTrail } from "@/components/AuditTrail";
import { NetworkInventory } from "@/components/NetworkInventory";
import { BenchmarkViewer } from "@/components/BenchmarkViewer";
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
  const [promptHistory, setPromptHistory] = useState<string[]>([
    "Block YouTube for the guest network",
    "Isolate the guest Wi-Fi from internal servers",
  ]);

  // Current Working State
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

  // Initial load
  useEffect(() => {
    // Initial parse to show demo state out-of-the-box
    handleParseIntent("Block YouTube for the guest network", "auto");
    refreshPolicyCount();
  }, []);

  const refreshPolicyCount = async () => {
    try {
      const pols = await listPolicies();
      setActivePolicyCount(pols.filter((p: any) => p.status === "applied").length);
    } catch {
      // offline / not ready yet
    }
  };

  const handleParseIntent = async (prompt: string, provider: string) => {
    setIsParsing(true);
    setCurrentPrompt(prompt);
    try {
      const res = await parseIntent(prompt, provider);
      setParsedIR(res.ir);
      setValidationReport(res.validation);
      setProviderUsed(res.provider_used);

      // Create policy draft in backend
      const polRes = await createPolicy(prompt, res.ir);
      setCurrentPolicyId(polRes.policy_id);
      setCompiledRules(polRes.compiled);
      setPolicyStatus("draft");
      setSimulationProbes([]);

      if (!promptHistory.includes(prompt)) {
        setPromptHistory((prev) => [prompt, ...prev]);
      }
    } catch (err: any) {
      alert("Error parsing intent: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSimulatePolicy = async () => {
    if (!currentPolicyId) return;
    setIsSimulating(true);
    setActiveTab("simulation");
    try {
      const res = await simulatePolicy(currentPolicyId);
      setSimulationProbes(res.results);
      setPolicyStatus("simulated");
    } catch (err: any) {
      alert("Simulation error: " + err.message);
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
      alert("Policy Approved & Applied to Gateway Firewall! nftables counters active.");
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
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-indigo-500/30">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePolicyCount={activePolicyCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

            <TopologyMap
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
            />
          </div>
        )}

        {/* TAB 2: SIMULATION LAB */}
        {activeTab === "simulation" && (
          <div className="space-y-6">
            <TopologyMap
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
            />

            <SimulationLab
              probes={simulationProbes}
              isSimulating={isSimulating}
              onApprove={handleApprovePolicy}
              isApproving={isApproving}
              appliedStatus={policyStatus}
              onViewDiff={() => setActiveTab("diff")}
            />
          </div>
        )}

        {/* TAB 3: RULE DIFF VIEWER */}
        {activeTab === "diff" && (
          <RuleDiffViewer compiled={compiledRules} policyId={currentPolicyId || undefined} />
        )}

        {/* TAB 4: POLICIES LIBRARY */}
        {activeTab === "policies" && (
          <PolicyLibrary onSelectPolicy={handleSelectPolicyFromLibrary} />
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === "audit" && <AuditTrail />}

        {/* TAB 6: NETWORK & SERVICES */}
        {activeTab === "inventory" && <NetworkInventory />}

        {/* TAB 7: BENCHMARK 100 */}
        {activeTab === "benchmark" && <BenchmarkViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        Intentwall v1.0 • Verifiable Natural-Language Firewall Engine • Free Tier & Open Source
      </footer>
    </div>
  );
}
