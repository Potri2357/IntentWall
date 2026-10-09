"""
Intentwall Core FastAPI Application
Provides REST endpoints, live probe SSE/WebSocket streaming, multi-vendor compilation,
audit trail, and benchmark execution.
"""

import os
import json
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from apps.api.ir.models import FirewallIntentIR, ValidationReport, CompiledRuleset
from apps.api.llm.gateway import parse_natural_language_intent
from apps.api.validate.validator import validate_intent
from apps.api.compile.compiler import compile_policy
from apps.api.compile.services import DEFAULT_ZONES, SERVICE_CATALOG
from apps.api.sim.topology import get_topology_definition
from apps.api.sim.test_plan import generate_test_plan
from apps.api.sim.runner import execute_probe, run_simulation_stream
from apps.api.audit.db import init_db, SessionLocal, log_audit_event, get_all_policies, get_audit_trail
from apps.api.audit.models import PolicyModel, PolicyVersionModel, SimulationRunModel
from benchmarks.evaluate import run_benchmark_evaluation

# Initialize SQLite tables
init_db()

app = FastAPI(
    title="Intentwall API",
    description="Deterministic Natural Language Firewall Engine with Live Emulation Verification",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class ParseIntentRequest(BaseModel):
    prompt: str = Field(..., description="Natural language firewall request")
    provider: str = Field("auto", description="LLM provider: auto, gemini, ollama, or deterministic")


class CreatePolicyRequest(BaseModel):
    prompt: str
    ir: FirewallIntentIR
    name: Optional[str] = None


class ApprovePolicyRequest(BaseModel):
    actor: str = "security-admin"
    confirm_override: bool = False


class RollbackRequest(BaseModel):
    target_version_id: Optional[str] = None
    actor: str = "security-admin"


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Intentwall Core v1.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/api/network")
def get_network_inventory():
    """Returns zones, subnets, hosts, and service catalog."""
    return {
        "topology": get_topology_definition(),
        "zones": DEFAULT_ZONES,
        "services": SERVICE_CATALOG
    }


@app.post("/api/intents/parse")
async def parse_intent_endpoint(req: ParseIntentRequest):
    """
    Translates natural-language request into IR and performs deterministic validation & lockout check.
    """
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    ir, provider_used = await parse_natural_language_intent(prompt, provider=req.provider)
    existing_policies = get_all_policies()
    val_report = validate_intent(ir, existing_policies=existing_policies)

    log_audit_event(
        action="parse_intent",
        object_ref=ir.intent_id,
        payload={
            "prompt": prompt,
            "provider": provider_used,
            "action": ir.action,
            "risk_score": val_report.risk_score,
            "lockout_safe": val_report.lockout_safe
        }
    )

    return {
        "ir": ir,
        "provider_used": provider_used,
        "validation": val_report
    }


@app.post("/api/policies")
def create_policy_endpoint(req: CreatePolicyRequest):
    """
    Creates a new policy with version 1 from validated IR.
    """
    policy_id = req.ir.intent_id or f"pol_{uuid.uuid4().hex[:6]}"
    ver_id = f"ver_{uuid.uuid4().hex[:6]}"
    name = req.name or f"Policy for {req.ir.source.ref} -> {req.ir.destination.ref}"

    val_report = validate_intent(req.ir)

    with SessionLocal() as db:
        existing_p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if existing_p:
            ver_num = len(existing_p.versions) + 1
            compiled = compile_policy(req.ir, policy_version_id=f"v{ver_num}")
            version = PolicyVersionModel(
                id=ver_id,
                policy_id=policy_id,
                version_num=ver_num,
                prompt=req.prompt,
                ir_json=json.dumps(req.ir.model_dump()),
                compiled_nft=compiled.nftables,
                compiled_ipt=compiled.iptables,
                compiled_cisco=compiled.cisco_acl,
                risk_score=val_report.risk_score,
                risk_level=val_report.risk_level,
                created_at=datetime.now(timezone.utc)
            )
            existing_p.active_version_id = ver_id
            existing_p.status = "draft"
            existing_p.updated_at = datetime.now(timezone.utc)
            db.add(version)
            db.commit()
        else:
            compiled = compile_policy(req.ir, policy_version_id="v1")
            policy = PolicyModel(
                id=policy_id,
                name=name,
                status="draft",
                active_version_id=ver_id,
                created_at=datetime.now(timezone.utc)
            )
            version = PolicyVersionModel(
                id=ver_id,
                policy_id=policy_id,
                version_num=1,
                prompt=req.prompt,
                ir_json=json.dumps(req.ir.model_dump()),
                compiled_nft=compiled.nftables,
                compiled_ipt=compiled.iptables,
                compiled_cisco=compiled.cisco_acl,
                risk_score=val_report.risk_score,
                risk_level=val_report.risk_level,
                created_at=datetime.now(timezone.utc)
            )
            db.add(policy)
            db.add(version)
            db.commit()

    log_audit_event(
        action="create_policy",
        object_ref=policy_id,
        payload={"policy_id": policy_id, "name": name, "version_id": ver_id}
    )

    return {
        "policy_id": policy_id,
        "version_id": ver_id,
        "status": "draft",
        "compiled": compiled
    }


@app.get("/api/policies")
def list_policies_endpoint():
    return get_all_policies()


@app.get("/api/policies/{policy_id}")
def get_policy_detail_endpoint(policy_id: str):
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")

        versions = []
        for v in p.versions:
            simulations = [
                {
                    "id": s.id,
                    "passed_count": s.passed_count,
                    "total_count": s.total_count,
                    "results": json.loads(s.results_json),
                    "started_at": s.started_at.isoformat()
                }
                for s in v.simulations
            ]
            versions.append({
                "id": v.id,
                "version_num": v.version_num,
                "prompt": v.prompt,
                "ir": json.loads(v.ir_json),
                "compiled_nft": v.compiled_nft,
                "compiled_ipt": v.compiled_ipt,
                "compiled_cisco": v.compiled_cisco,
                "risk_score": v.risk_score,
                "risk_level": v.risk_level,
                "simulations": simulations,
                "created_at": v.created_at.isoformat()
            })

        return {
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "active_version_id": p.active_version_id,
            "versions": versions
        }


@app.post("/api/policies/{policy_id}/compile")
def compile_policy_endpoint(policy_id: str):
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")

        v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Active policy version not found")

        ir = FirewallIntentIR(**json.loads(v.ir_json))
        compiled = compile_policy(ir, policy_version_id=f"v{v.version_num}")
        return compiled


@app.post("/api/policies/{policy_id}/simulate")
async def simulate_policy_endpoint(policy_id: str):
    """
    Executes probe simulation suite synchronously and stores results.
    """
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")
        v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Active version not found")

        ir = FirewallIntentIR(**json.loads(v.ir_json))

    test_plan = generate_test_plan(ir)
    results = []
    passed_count = 0

    for test in test_plan:
        res = await execute_probe(test, ir)
        if res.passed:
            passed_count += 1
        results.append(res.model_dump())

    run_id = f"sim_{uuid.uuid4().hex[:6]}"
    with SessionLocal() as db:
        sim_run = SimulationRunModel(
            id=run_id,
            version_id=v.id,
            passed_count=passed_count,
            total_count=len(test_plan),
            results_json=json.dumps(results),
            started_at=datetime.utcnow(),
            finished_at=datetime.utcnow()
        )
        db.add(sim_run)

        # Update policy status to 'simulated' if currently draft
        p_obj = db.query(PolicyModel).filter_by(id=policy_id).first()
        if p_obj and p_obj.status == "draft":
            p_obj.status = "simulated"
        db.commit()

    log_audit_event(
        action="simulate_policy",
        object_ref=policy_id,
        payload={"run_id": run_id, "passed": passed_count, "total": len(test_plan)}
    )

    return {
        "run_id": run_id,
        "passed_count": passed_count,
        "total_count": len(test_plan),
        "all_passed": (passed_count == len(test_plan)),
        "results": results
    }


@app.get("/api/policies/{policy_id}/stream")
async def stream_simulation_endpoint(policy_id: str):
    """
    Server-Sent Events (SSE) endpoint to stream live probe results to the web UI.
    """
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")
        v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Active version not found")

        ir = FirewallIntentIR(**json.loads(v.ir_json))

    tests = generate_test_plan(ir)

    async def event_generator():
        yield f"data: {json.dumps({'event': 'start', 'total': len(tests)})}\n\n"
        completed = 0
        passed = 0
        for test in tests:
            res = await execute_probe(test, ir)
            completed += 1
            if res.passed:
                passed += 1
            payload = {
                "event": "probe_result",
                "progress": f"{completed}/{len(tests)}",
                "result": res.model_dump()
            }
            yield f"data: {json.dumps(payload)}\n\n"

        yield f"data: {json.dumps({'event': 'done', 'passed': passed, 'total': len(tests)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


@app.post("/api/policies/{policy_id}/approve")
def approve_policy_endpoint(policy_id: str, req: ApprovePolicyRequest):
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")

        v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Active version not found")

        val_report = validate_intent(FirewallIntentIR(**json.loads(v.ir_json)))
        if not val_report.lockout_safe and not req.confirm_override:
            raise HTTPException(status_code=400, detail="Cannot apply policy: Management lockout guard violated!")

        active_ver_id = p.active_version_id
        p.status = "applied"
        p.updated_at = datetime.now(timezone.utc)
        db.commit()

    log_audit_event(
        action="approve_and_apply",
        object_ref=policy_id,
        payload={"policy_id": policy_id, "actor": req.actor, "version_id": active_ver_id},
        actor=req.actor
    )

    return {"status": "applied", "policy_id": policy_id}


@app.post("/api/policies/{policy_id}/rollback")
def rollback_policy_endpoint(policy_id: str, req: RollbackRequest):
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")

        p.status = "rolled_back"
        p.updated_at = datetime.now(timezone.utc)
        db.commit()

    log_audit_event(
        action="rollback_policy",
        object_ref=policy_id,
        payload={"policy_id": policy_id, "actor": req.actor},
        actor=req.actor
    )

    return {"status": "rolled_back", "policy_id": policy_id}


@app.get("/api/policies/{policy_id}/explain")
def explain_policy_endpoint(policy_id: str):
    with SessionLocal() as db:
        p = db.query(PolicyModel).filter_by(id=policy_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")
        v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Active version not found")

        ir = FirewallIntentIR(**json.loads(v.ir_json))

    return {
        "policy_id": policy_id,
        "explanation": ir.explanation,
        "action": ir.action,
        "source": ir.source.ref,
        "destination": ir.destination.ref,
        "confidence": ir.confidence,
        "ambiguities": ir.ambiguities
    }


@app.get("/api/audit")
def get_audit_endpoint(limit: int = 50):
    return get_audit_trail(limit=limit)


@app.get("/api/benchmarks/run")
def run_benchmark_endpoint():
    """Executes the 100-prompt benchmark evaluation suite."""
    return run_benchmark_evaluation()
