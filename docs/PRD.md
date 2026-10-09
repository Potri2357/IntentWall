# Intentwall: Product Requirements Document

**Tagline:** Say it in plain English. Watch it get proven in a live network sandbox. Then ship it.

**Version:** 1.0 | **Date:** 9 Oct 2026 | **Type:** Mini project (software only) | **Frontend:** Next.js + Tailwind CSS + shadcn/ui | **Budget:** zero cost (free tiers and open source only)

---

## 1. Executive Summary

Intentwall turns a sentence such as *"block YouTube for the guest network"* into a reviewed, tested and auditable firewall policy. The LLM is only used to understand intent. A deterministic pipeline then validates the intent, compiles it to nftables or iptables, deploys it into an emulated network (Mininet or Docker), and automatically proves it works by running generated traffic tests (guest cannot reach YouTube, staff still can, nothing else broke).

The differentiator is **verification by emulation**. Every competitor researched below generates or suggests a rule and asks a human to trust it. Intentwall shows pass/fail evidence on a live topology before anything is applied.

**Cost:** the whole stack is free. The LLM is Google's Gemini API on its free tier (no billing needed), with a local Ollama model as an offline fallback, and the sandbox, backend, database and frontend are all open-source tools.

## 2. Problem and Opportunity

- Firewall rules are written in vendor-specific syntax that is easy to get wrong. A typo or wrong rule order can open a hole or cause an outage.
- Non-experts (small offices, labs, students, home users) cannot safely express simple policies like "block social media after 6 PM".
- Plain LLM output is not trustworthy for this task: rules can be syntactically valid but semantically wrong for the hook, chain or direction.
- Enterprise tools that offer natural-language policy are closed, vendor-locked and tied to expensive platforms. There is no open, vendor-neutral, *evidence-producing* option.

**Opportunity:** a premium, open, self-hostable tool that combines the convenience of AI with the safety of testing.

## 3. Competitive Landscape and Research

### 3.1 Commercial products

| Product | What it does | Strengths | Gaps relative to Intentwall |
|---|---|---|---|
| **Cisco AI Assistant for Firewall / Policy Copilot** (cdFMC) | Natural-language policy lookup, rule recommendation, conflict analysis and deployment readiness checks. Announced Dec 2023; recommended rules require admin approval. | Deep context from existing policy, enterprise workflow | Cisco-only, cloud-managed, no traffic-level proof, closed |
| **Cloudflare Gateway "Create with AI"** (May 2026) | Describe a DNS, HTTP or Network policy and it fills the policy builder, resolving your lists, apps and device posture. Has rating feedback. | Polished UX, account-aware, editable before save | Cloudflare Zero Trust only, no simulation, no on-prem firewall output |
| **Cato Networks "Ask AI"** | Suggests an Internet Firewall rule from investigation, adds it as an unpublished revision at lowest priority, logs to audit trail. | Safe-by-default staging, audit trail | Cato only, rule placement fixed, no testing |
| **Check Point AI Copilot** (SmartConsole R81.20+) | Answers questions about policies, objects and logs; trained on admin guides. | Strong Q&A over existing config | Primarily explain/query, vendor-locked |
| **AlgoSec AlgoBot** | Chat interface for policy queries (English and French), traffic permission checks, change requests. | Multi-vendor, workflow integration | Enterprise licensing, query and ticketing focus, no sandbox proof |
| **Tufin / FireMon** | Policy orchestration, change workflows, compliance across vendors. | Mature multi-vendor automation | Heavyweight, not natural-language-first |
| **PwC Firewall Rule Analyzer** | AI analysis of large rule sets with a natural-language query layer. | Scale, audit focus | Analysis, not creation or verification |

### 3.2 Academic and open-source work

| Work | Takeaway for our design |
|---|---|
| **NYU "Natural Language Interface for Firewall Configuration"** (arXiv 2512.10789) | Uses a typed intermediate representation (IR); the LLM only produces IR objects and compilation stays deterministic (prototype targets PAN-OS CLI). Validates our core architecture. Tested on synthetic data only. |
| **NetConfEval** (KTH, CoNEXT 2024) | Benchmark for LLM network configuration. Finding: small models can handle requirement-to-formal-spec translation, but generating device-control code needs larger models. Supports "LLM to spec, code to config". |
| **Politecnico di Torino thesis (2026)** | Agentic LangGraph workflow converting natural language to OpenC2 firewall commands. Shows multi-stage agent patterns. |
| **NetPilot** | AI-generated configs for lab topologies (cloud ContainerLab). Focus on lab setup, not policy proof. |
| **Hobby iptables generators** (GitHub) | JSON or questionnaire based, no AI, mostly unmaintained. Shows the low end of the market. |

### 3.3 Key insights

1. **Common pattern:** every serious product keeps a human in the loop, stages changes (draft or unpublished), shows what will change and logs it. We must match this baseline.
2. **Context matters:** the best tools resolve names against existing objects and lists. Intentwall needs a network inventory (zones, subnets, hosts) the LLM can reference.
3. **Gap 1: verification.** No researched competitor demonstrates the policy working on live traffic before deployment.
4. **Gap 2: openness.** Everything polished is closed and single-vendor. A vendor-neutral compiler (nftables, iptables, Cisco-style ACL export) is unclaimed.
5. **Gap 3: explainability for beginners.** Enterprise tools assume admin knowledge. A visual "before vs after" with plain-language explanation is an opening.
6. **Research lesson:** separating intent (LLM) from enforcement (deterministic) is the consistent best practice.

### 3.4 Positioning

> **"The only natural-language firewall that proves its rules before it ships them."**

Target feel: Cloudflare-grade polish, Cisco-grade safety, open-source freedom.

## 4. Goals, Non-Goals and Success Metrics

### Goals

- G1: Convert natural-language requests into correct, verified firewall rules.
- G2: Prove each policy with automated positive and negative traffic tests in an emulated network.
- G3: Deliver a premium, demo-ready web experience.
- G4: Provide full auditability (who asked, what the AI produced, what was tested, what was applied).

### Non-goals (v1)

- Managing real production enterprise firewalls (Palo Alto, Fortinet, Cisco) beyond config *export*.
- Deep packet inspection engines or a full NGFW.
- Multi-tenant SaaS billing.
- Hardware deployment.

### Success metrics

| Metric | Target |
|---|---|
| Intent extraction accuracy on 100-prompt test set | at least 90% |
| Policies passing generated probe tests on first compile | at least 85% |
| False-allow rate (traffic that should be blocked but passes) | 0 in demo scenarios, below 3% in test set |
| Prompt to verified result time | under 20 seconds (including the Gemini API round trip) |
| Management lockout incidents caused by generated policy | 0 (guaranteed by safety guard) |
| Lighthouse performance and accessibility | 90+ |

## 5. Personas

1. **Riya, the lab or college admin:** wants guest Wi-Fi restrictions without learning iptables.
2. **Arun, the junior network engineer:** wants a safe draft and an explanation before touching production.
3. **Meera, the security reviewer:** wants evidence, diffs and an audit trail to approve changes.
4. **Judge or evaluator (project context):** wants a clear 5-minute story with a visible wow moment.

## 6. Core User Journey (the Demo Moment)

1. User opens the dashboard and sees the live topology: *Internet, Gateway/Firewall, Guest VLAN, Staff VLAN, Servers*.
2. User types: **"Block YouTube for the guest network."**
3. Intentwall shows the **parsed intent card**: Action = Deny, Source = Guest (10.10.20.0/24), Destination = Service: YouTube, Protocols = TCP/443 + UDP/443 (QUIC), Direction = Outbound.
4. It flags ambiguities or risks (e.g., "YouTube uses many CDN addresses; domain-based resolution will be used").
5. User clicks **Simulate**. Probe tests run live on the topology:
   - Guest to youtube.com: **blocked (pass)**
   - Staff to youtube.com: **allowed (pass)**
   - Guest to wikipedia.org: **allowed (pass, no collateral damage)**
   - Guest to gateway DNS: **allowed (pass)**
6. Topology animates: guest-to-YouTube edge turns red, others stay green. Diff view shows the generated nftables rules.
7. User approves, the policy is applied, versioned and audit-logged. One-click rollback is available.

## 7. Functional Requirements

Priority: **P0** = must ship, **P1** = should ship, **P2** = stretch.

### 7.1 Natural-language intake

- FR-1 (P0): Free-text prompt box with example chips and history.
- FR-2 (P0): Supported intents: block, allow, rate-limit, time-schedule, isolate, log-only.
- FR-3 (P0): Entities: zones/networks, hosts, services (catalog), ports, protocols, time windows.
- FR-4 (P1): Clarifying questions when the prompt is ambiguous (e.g., "which network is guest?").
- FR-5 (P2): Voice input.

### 7.2 Intent understanding (LLM layer)

- FR-6 (P0): LLM returns **only** structured JSON conforming to the IR schema (schema-constrained JSON output, which the Gemini API supports).
- FR-7 (P0): Prompt includes the network context (zones, subnets, known services) so references resolve correctly.
- FR-8 (P0): Confidence score and an explanation sentence per parsed intent.
- FR-9 (P1): Pluggable model providers behind one interface: Gemini (free tier) by default, a local Ollama model as the offline fallback, and a rule-based keyword parser as the last resort. Responses are cached by prompt hash and retried with backoff to stay within rate limits.
- FR-10 (P0): Prompt-injection hardening: user text is treated as data and the model has no ability to run commands.

### 7.3 Validation and safety guard (deterministic)

- FR-11 (P0): Schema validation and entity resolution (unknown zone or service means reject with suggestion).
- FR-12 (P0): **Lockout protection:** never allow policies that block the management plane (SSH or API to controller, DNS or DHCP to the gateway) without explicit override.
- FR-13 (P0): **Conflict and shadowing detection** against existing rules (duplicate, shadowed, contradictory).
- FR-14 (P0): **Blast-radius estimate:** number of hosts and flows affected.
- FR-15 (P1): Risk score (Low, Medium, High) with reasons; High requires second approval.

### 7.4 Compilation

- FR-16 (P0): Compile IR to **nftables** (primary), validated with a dry-run syntax check before use.
- FR-17 (P1): Compile to **iptables** (legacy export).
- FR-18 (P1): Export as Cisco-style extended ACL text (vendor-neutral demonstration).
- FR-19 (P0): Rule placement logic (priority and ordering) is computed by the compiler, never by the LLM.
- FR-20 (P0): Service catalog (YouTube, Facebook, Instagram, Netflix, WhatsApp, Spotify, etc.) mapping names to domains and ports, including QUIC.
- FR-21 (P1): Dynamic domain resolution: a resolver keeps nftables sets updated with timeouts as DNS answers change.

### 7.5 Simulation and verification (the differentiator)

- FR-22 (P0): One-click topology spin-up (Mininet or Docker/Containerlab) from a topology definition.
- FR-23 (P0): **Auto-generated test plan** from the IR: positive tests (should pass), negative tests (should be blocked) and regression tests (unrelated traffic still works).
- FR-24 (P0): Execute probes (curl, ping, dig, nc, iperf) inside emulated hosts and stream results live.
- FR-25 (P0): Per-test pass/fail with captured evidence (command, output, timestamps).
- FR-26 (P1): Before and after comparison: same probe suite run pre-policy and post-policy.
- FR-27 (P1): Packet counters per rule (hit counts) displayed on the rule diff.
- FR-28 (P2): Replay a recorded pcap against the candidate policy.

### 7.6 Review, apply and audit

- FR-29 (P0): Policy states: Draft, Simulated, Approved, Applied, Rolled back.
- FR-30 (P0): Apply to the sandbox gateway (and optionally a configured Linux host in lab mode).
- FR-31 (P0): Immutable audit log: prompt, parsed IR, model and version, compiled rules, test results, approver, timestamps.
- FR-32 (P0): One-click rollback to any previous version.
- FR-33 (P1): Auto-rollback timer ("confirm within 60 seconds or revert") for safe live changes.
- FR-34 (P1): Export report (PDF or Markdown) of a policy change with evidence.

### 7.7 Insights

- FR-35 (P1): Explain mode: "Why is guest blocked from YouTube?" traces the matching rule.
- FR-36 (P1): Policy health view: shadowed or unused rules and suggested clean-up.
- FR-37 (P2): Natural-language *queries* ("what can guest reach?") answered from the policy model.

## 8. System Architecture

```
Next.js UI  <-- REST + WebSocket/SSE -->  FastAPI Backend
                                              |
   +------------------------------------------+---------------------------+
   |                |                |                 |                    |
 LLM Gateway   Validator &      Compiler          Sandbox Runner       Audit Store
 (IR only)     Safety Guard   (nft/ipt/ACL)   (Mininet/Containerlab)     (SQLite)
                                                     |
                                              Emulated topology
                                       (guest, staff, server, gateway)
```

## 9. Recommended Tech Stack

- Python 3.12+ FastAPI backend, Pydantic v2, SQLite, SQLAlchemy.
- Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, React Flow (xyflow), Monaco Editor, Framer Motion, Lucide icons.
- Linux nftables / Mininet / Containerlab / Python emulated engine with dual-backend support.
