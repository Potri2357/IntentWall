"""
Deterministic Validator and Safety Guard for Intentwall
Performs entity resolution, lockout checks, risk scoring, and blast-radius estimation.
"""

from typing import List, Dict, Any, Optional
from apps.api.ir.models import FirewallIntentIR, ValidationReport, ValidationIssue
from apps.api.compile.services import lookup_service, lookup_zone, DEFAULT_ZONES, SERVICE_CATALOG
from apps.api.validate.lockout_guard import check_lockout_risk
from apps.api.validate.conflicts import detect_rule_conflicts


def validate_intent(
    intent: FirewallIntentIR,
    existing_policies: Optional[List[Dict[str, Any]]] = None
) -> ValidationReport:
    """
    Validates an IR intent against network entities, safety invariants,
    and returns an actionable ValidationReport.
    """
    issues: List[ValidationIssue] = []
    risk_score = 10  # base baseline score
    affected_zones: List[str] = []
    estimated_hosts = 0

    # 1. Entity resolution: Source
    src_ref = intent.source.ref.lower()
    src_zone = lookup_zone(src_ref)
    if intent.source.type == "zone":
        if src_zone:
            affected_zones.append(src_zone["name"])
            estimated_hosts += len(src_zone.get("sample_hosts", [])) * 10
        elif src_ref != "any":
            issues.append(ValidationIssue(
                severity="warning",
                code="UNKNOWN_SOURCE_ZONE",
                message=f"Source zone '{intent.source.ref}' is not in the configured network inventory.",
                suggested_fix=f"Available zones: {', '.join(DEFAULT_ZONES.keys())}"
            ))
            risk_score += 15

    # 2. Entity resolution: Destination
    dst_ref = intent.destination.ref.lower()
    if intent.destination.type == "service":
        svc = lookup_service(dst_ref)
        if not svc:
            issues.append(ValidationIssue(
                severity="error",
                code="UNKNOWN_SERVICE",
                message=f"Service '{intent.destination.ref}' not recognized in service catalog.",
                suggested_fix=f"Catalog includes: {', '.join(list(SERVICE_CATALOG.keys())[:8])}..."
            ))
            risk_score += 25
    elif intent.destination.type == "zone":
        dst_zone = lookup_zone(dst_ref)
        if dst_zone:
            affected_zones.append(dst_zone["name"])
        elif dst_ref != "any":
            issues.append(ValidationIssue(
                severity="warning",
                code="UNKNOWN_DEST_ZONE",
                message=f"Destination zone '{intent.destination.ref}' is not registered.",
                suggested_fix=f"Available zones: {', '.join(DEFAULT_ZONES.keys())}"
            ))
            risk_score += 15

    # 3. Lockout Protection Check
    lockout_safe, lockout_issues = check_lockout_risk(intent)
    issues.extend(lockout_issues)
    if not lockout_safe:
        risk_score += 60

    # 4. Conflict & Shadowing Detection
    conflicts = detect_rule_conflicts(intent, existing_policies or [])
    for c in conflicts:
        if c.get("severity") == "critical":
            risk_score += 30
            issues.append(ValidationIssue(
                severity="critical",
                code="POLICY_CONTRADICTION",
                message=c["message"]
            ))
        elif c.get("severity") == "warning":
            risk_score += 15
            issues.append(ValidationIssue(
                severity="warning",
                code="POLICY_OVERLAP",
                message=c["message"]
            ))

    # 5. Blast Radius & Scope Scoring
    if dst_ref == "any" and intent.action in ("deny", "isolate"):
        risk_score += 25
        estimated_flows = "all external & internal"
        issues.append(ValidationIssue(
            severity="warning",
            code="BROAD_BLAST_RADIUS",
            message="Rule targets destination 'any', which affects all traffic egress from the source.",
            suggested_fix="Scope rule to specific service, port, or subnet."
        ))
    else:
        estimated_flows = "service-specific"

    if estimated_hosts == 0:
        estimated_hosts = 15

    # Normalize risk score 0-100
    risk_score = min(100, max(0, risk_score))

    if risk_score >= 70 or not lockout_safe:
        risk_level = "critical" if not lockout_safe else "high"
    elif risk_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    has_errors = any(i.severity in ("error", "critical") for i in issues)
    valid = (not has_errors) and lockout_safe

    return ValidationReport(
        valid=valid,
        risk_level=risk_level,
        risk_score=risk_score,
        blast_radius={
            "affected_zones": list(set(affected_zones)),
            "estimated_hosts": estimated_hosts,
            "estimated_flows": estimated_flows
        },
        issues=issues,
        lockout_safe=lockout_safe,
        conflicts=conflicts
    )
