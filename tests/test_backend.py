"""
Unit and Integration Test Suite for Intentwall
Tests: IR parsing, lockout guards, multi-target compilers, simulation runner, and API endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.ir.models import FirewallIntentIR, EndpointRef, ProtocolPort
from apps.api.llm.keyword_parser import parse_intent_keywords
from apps.api.validate.validator import validate_intent
from apps.api.validate.lockout_guard import check_lockout_risk
from apps.api.compile.compiler import compile_policy
from apps.api.sim.test_plan import generate_test_plan

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_keyword_parser_block_youtube():
    ir = parse_intent_keywords("Block YouTube for the guest network")
    assert ir is not None
    assert ir.action == "deny"
    assert ir.source.ref == "guest"
    assert ir.destination.ref == "youtube"
    assert ir.destination.type == "service"


def test_keyword_parser_isolation():
    ir = parse_intent_keywords("Isolate the guest Wi-Fi from internal servers")
    assert ir is not None
    assert ir.action == "isolate"
    assert ir.source.ref == "guest"
    assert ir.destination.ref == "servers"


def test_lockout_guard_prevents_ssh_lockout():
    ir = FirewallIntentIR(
        intent_id="pol_dangerous",
        action="deny",
        source=EndpointRef(type="zone", ref="guest"),
        destination=EndpointRef(type="any", ref="any"),
        protocols=[ProtocolPort(proto="tcp", port=22)],
        direction="inbound",
        explanation="Block SSH"
    )
    is_safe, issues = check_lockout_risk(ir)
    assert not is_safe
    assert any(iss.code == "LOCKOUT_PORT_22" for iss in issues)

    report = validate_intent(ir)
    assert not report.valid
    assert not report.lockout_safe
    assert report.risk_level == "critical"


def test_lockout_guard_prevents_mgmt_zone_block():
    ir = FirewallIntentIR(
        intent_id="pol_mgmt_block",
        action="deny",
        source=EndpointRef(type="zone", ref="guest"),
        destination=EndpointRef(type="zone", ref="mgmt"),
        protocols=[],
        direction="forward",
        explanation="Deny access to management"
    )
    is_safe, issues = check_lockout_risk(ir)
    assert not is_safe
    assert any("LOCKOUT_MANAGEMENT_ZONE_BLOCKED" in iss.code for iss in issues)


def test_multi_target_compilation():
    ir = parse_intent_keywords("Block YouTube for the guest network")
    compiled = compile_policy(ir)

    assert "table inet intentwall_filter" in compiled.nftables
    assert "set svc_youtube_ips" in compiled.nftables
    assert "ct state established,related accept" in compiled.nftables
    assert "udp dport 443" in compiled.nftables  # QUIC blocking

    # iptables check
    assert "*filter" in compiled.iptables
    assert "-A FORWARD" in compiled.iptables

    # Cisco ACL check
    assert "ip access-list extended" in compiled.cisco_acl
    assert "deny" in compiled.cisco_acl


def test_test_plan_generation():
    ir = parse_intent_keywords("Block YouTube for the guest network")
    tests = generate_test_plan(ir)
    assert len(tests) >= 5

    # Should contain negative probe for youtube
    neg_tests = [t for t in tests if t.category == "negative"]
    assert len(neg_tests) >= 1
    assert any("youtube" in t.name.lower() for t in neg_tests)

    # Should contain regression probe for wikipedia
    regr_tests = [t for t in tests if t.category == "regression"]
    assert any("wikipedia" in t.name.lower() for t in regr_tests)

    # Should contain management probe for SSH
    mgmt_tests = [t for t in tests if t.category == "management"]
    assert any("ssh" in t.name.lower() for t in mgmt_tests)


def test_api_parse_and_simulate_flow():
    # 1. Parse
    parse_resp = client.post("/api/intents/parse", json={"prompt": "Block YouTube for the guest network"})
    assert parse_resp.status_code == 200
    data = parse_resp.json()
    assert data["ir"]["action"] == "deny"
    assert data["validation"]["valid"] is True

    # 2. Create policy
    create_resp = client.post("/api/policies", json={
        "prompt": "Block YouTube for the guest network",
        "ir": data["ir"]
    })
    assert create_resp.status_code == 200
    pol_id = create_resp.json()["policy_id"]

    # 3. Simulate
    sim_resp = client.post(f"/api/policies/{pol_id}/simulate")
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["all_passed"] is True
    assert sim_data["passed_count"] == sim_data["total_count"]

    # 4. Approve
    appr_resp = client.post(f"/api/policies/{pol_id}/approve", json={"actor": "test-admin"})
    assert appr_resp.status_code == 200
    assert appr_resp.json()["status"] == "applied"

    # 5. Rollback
    rb_resp = client.post(f"/api/policies/{pol_id}/rollback", json={"actor": "test-admin"})
    assert rb_resp.status_code == 200
    assert rb_resp.json()["status"] == "rolled_back"
