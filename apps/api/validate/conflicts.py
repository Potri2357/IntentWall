"""
Conflict and Shadowing Detection for Intentwall
Identifies duplicate, contradictory, or shadowed firewall rules against the existing policy set.
"""

from typing import List, Dict, Any
from apps.api.ir.models import FirewallIntentIR, ValidationIssue


def detect_rule_conflicts(
    candidate: FirewallIntentIR,
    existing_policies: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Analyzes candidate intent against already active/approved policies.
    Returns list of conflict items with type, details, and impact.
    """
    conflicts: List[Dict[str, Any]] = []

    for pol in existing_policies:
        pol_ir = pol.get("ir")
        if not pol_ir:
            continue

        existing_id = pol.get("id", pol.get("intent_id", "unknown"))
        existing_action = pol_ir.get("action")
        existing_src = pol_ir.get("source", {}).get("ref")
        existing_dst = pol_ir.get("destination", {}).get("ref")

        cand_src = candidate.source.ref
        cand_dst = candidate.destination.ref

        same_endpoints = (
            cand_src.lower() == str(existing_src).lower() and
            cand_dst.lower() == str(existing_dst).lower()
        )

        if same_endpoints:
            if candidate.action == existing_action:
                conflicts.append({
                    "type": "duplicate",
                    "severity": "warning",
                    "conflicting_policy_id": existing_id,
                    "message": f"Identical policy '{existing_id}' is already active with action '{candidate.action}' between {cand_src} and {cand_dst}."
                })
            else:
                conflicts.append({
                    "type": "contradiction",
                    "severity": "critical",
                    "conflicting_policy_id": existing_id,
                    "message": f"Contradictory policy '{existing_id}' has action '{existing_action}', while new intent specifies '{candidate.action}'."
                })

        # Check shadowing: e.g. existing rule has destination "any" with action deny or allow
        if str(existing_src).lower() == cand_src.lower() and str(existing_dst).lower() == "any":
            conflicts.append({
                "type": "shadowed",
                "severity": "warning",
                "conflicting_policy_id": existing_id,
                "message": f"Existing policy '{existing_id}' applies action '{existing_action}' to ALL traffic from {cand_src}, potentially shadowing this specific rule."
            })

    return conflicts
