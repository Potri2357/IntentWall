/**
 * Intentwall Frontend API Client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface EndpointRef {
  type: "zone" | "host" | "subnet" | "service" | "any";
  ref: string;
  cidr?: string;
}

export interface ProtocolPort {
  proto: string;
  port?: number | string;
}

export interface FirewallIntentIR {
  intent_id: string;
  action: "deny" | "allow" | "rate-limit" | "isolate" | "log-only";
  source: EndpointRef;
  destination: EndpointRef;
  protocols: ProtocolPort[];
  direction: "inbound" | "outbound" | "forward" | "both";
  schedule?: any;
  rate_limit?: { rate: number; unit: string; burst?: number };
  log: boolean;
  confidence: number;
  explanation: string;
  ambiguities: string[];
}

export interface ValidationIssue {
  severity: "info" | "warning" | "error" | "critical";
  code: string;
  message: string;
  suggested_fix?: string;
}

export interface ValidationReport {
  valid: boolean;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  blast_radius: {
    affected_zones: string[];
    estimated_hosts: number;
    estimated_flows: string;
  };
  issues: ValidationIssue[];
  lockout_safe: boolean;
  conflicts: any[];
}

export interface CompiledRuleset {
  nftables: string;
  iptables: string;
  cisco_acl: string;
  tables_json?: any;
  applied_rules_count: number;
  summary: string;
}

export interface ProbeResult {
  test_id: string;
  name: string;
  category: "positive" | "negative" | "regression" | "management";
  command: string;
  expected: string;
  actual: string;
  passed: boolean;
  evidence: string;
  latency_ms: number;
  timestamp: string;
  packet_trace?: string[];
}

export async function parseIntent(prompt: string, provider: string = "auto"): Promise<{
  ir: FirewallIntentIR;
  provider_used: string;
  validation: ValidationReport;
}> {
  const res = await fetch(`${API_BASE}/api/intents/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider }),
  });
  if (!res.ok) {
    throw new Error(`Parse failed: ${res.statusText}`);
  }
  return res.json();
}

export async function createPolicy(prompt: string, ir: FirewallIntentIR, name?: string): Promise<{
  policy_id: string;
  version_id: string;
  status: string;
  compiled: CompiledRuleset;
}> {
  const res = await fetch(`${API_BASE}/api/policies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ir, name }),
  });
  if (!res.ok) {
    throw new Error(`Policy creation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getPolicy(policyId: string) {
  const res = await fetch(`${API_BASE}/api/policies/${policyId}`);
  if (!res.ok) throw new Error("Policy not found");
  return res.json();
}

export async function listPolicies() {
  const res = await fetch(`${API_BASE}/api/policies`);
  if (!res.ok) throw new Error("Failed to list policies");
  return res.json();
}

export async function simulatePolicy(policyId: string): Promise<{
  run_id: string;
  passed_count: number;
  total_count: number;
  all_passed: boolean;
  results: ProbeResult[];
}> {
  const res = await fetch(`${API_BASE}/api/policies/${policyId}/simulate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Simulation failed");
  return res.json();
}

export async function approvePolicy(policyId: string, actor: string = "security-admin", confirmOverride: boolean = false) {
  const res = await fetch(`${API_BASE}/api/policies/${policyId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor, confirm_override: confirmOverride }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Approval failed");
  }
  return res.json();
}

export async function rollbackPolicy(policyId: string, actor: string = "security-admin") {
  const res = await fetch(`${API_BASE}/api/policies/${policyId}/rollback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  });
  if (!res.ok) throw new Error("Rollback failed");
  return res.json();
}

export async function getAuditTrail() {
  const res = await fetch(`${API_BASE}/api/audit`);
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}

export async function getNetworkInventory() {
  const res = await fetch(`${API_BASE}/api/network`);
  if (!res.ok) throw new Error("Failed to fetch network inventory");
  return res.json();
}

export async function runBenchmarks() {
  const res = await fetch(`${API_BASE}/api/benchmarks/run`);
  if (!res.ok) throw new Error("Failed to run benchmark suite");
  return res.json();
}
