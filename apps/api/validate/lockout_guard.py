"""
Lockout Guard for Intentwall
Protects management planes, SSH, gateway DNS, DHCP, and critical infrastructure
from accidental firewall lockouts.
"""

from typing import List, Tuple
from apps.api.ir.models import FirewallIntentIR, ValidationIssue

CRITICAL_MANAGEMENT_PORTS = {
    22: "SSH management terminal",
    8000: "Intentwall API controller",
    8443: "Management Web GUI",
    53: "Gateway DNS resolution",
    67: "DHCP server to client",
    68: "DHCP client to server"
}

MANAGEMENT_ZONES = {"mgmt", "management", "controller"}
MANAGEMENT_SUBNETS = ["192.168.100.0/24", "127.0.0.1/32"]


def check_lockout_risk(intent: FirewallIntentIR) -> Tuple[bool, List[ValidationIssue]]:
    """
    Evaluates whether the intent poses a critical lockout risk to management,
    DNS, DHCP, or API services. Returns (is_safe, list_of_issues).
    """
    issues: List[ValidationIssue] = []
    is_safe = True

    # Lockouts happen primarily on DENY / ISOLATE actions
    if intent.action not in ("deny", "isolate"):
        return True, issues

    src_ref = intent.source.ref.lower()
    dst_ref = intent.destination.ref.lower()

    # 1. Check if management zone or gateway is targeted for blocking
    if dst_ref in MANAGEMENT_ZONES:
        is_safe = False
        issues.append(
            ValidationIssue(
                severity="critical",
                code="LOCKOUT_MANAGEMENT_ZONE_BLOCKED",
                message=f"Rule denies access to critical management zone '{dst_ref}'. This will disconnect administrative controllers.",
                suggested_fix="Exclude management CIDR 192.168.100.0/24 or target specific non-management destination."
            )
        )

    # 2. Check if destination is 'any' or subnet containing gateway/management
    if dst_ref == "any" and intent.direction in ("inbound", "both", "forward"):
        # Check if ports overlap critical management ports
        targeted_ports = [p.port for p in intent.protocols if p.port is not None]
        for port in targeted_ports:
            port_num = int(port) if isinstance(port, int) or (isinstance(port, str) and str(port).isdigit()) else None
            if port_num in CRITICAL_MANAGEMENT_PORTS:
                is_safe = False
                issues.append(
                    ValidationIssue(
                        severity="critical",
                        code=f"LOCKOUT_PORT_{port_num}",
                        message=f"Denying port {port_num} ({CRITICAL_MANAGEMENT_PORTS[port_num]}) will sever administrative connectivity or core DHCP/DNS network operations.",
                        suggested_fix=f"Add explicit exception allowing {CRITICAL_MANAGEMENT_PORTS[port_num]} from authorized subnets."
                    )
                )

    # 3. Check for total isolation without management pinhole
    if intent.action == "isolate":
        if src_ref in MANAGEMENT_ZONES:
            is_safe = False
            issues.append(
                ValidationIssue(
                    severity="critical",
                    code="LOCKOUT_ISOLATE_MGMT",
                    message="Cannot isolate the management zone itself.",
                    suggested_fix="Isolate only untrusted user or guest zones."
                )
            )
        else:
            issues.append(
                ValidationIssue(
                    severity="warning",
                    code="ISOLATION_SAFETY_NOTICE",
                    message=f"Zone '{src_ref}' will be isolated from all inter-VLAN routing, but management access and gateway DNS will remain preserved.",
                    suggested_fix="Verify management bypass rules."
                )
            )

    return is_safe, issues
