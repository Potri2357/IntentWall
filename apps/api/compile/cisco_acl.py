"""
Cisco Extended ACL Compiler for Intentwall
Generates Cisco IOS-XE/ASA compatible extended access-list definitions.
"""

from typing import List, Tuple
from apps.api.ir.models import FirewallIntentIR
from apps.api.compile.services import lookup_service, lookup_zone


def compile_to_cisco_acl(intent: FirewallIntentIR, acl_name: str = "INTENTWALL_EXTENDED") -> Tuple[str, int]:
    """
    Compiles IR to Cisco-style extended ACL syntax (e.g., ip access-list extended INTENTWALL_EXTENDED).
    """
    lines: List[str] = [
        f"! Cisco IOS-XE Extended Access List - Policy [{intent.intent_id}]",
        f"! Description: {intent.explanation}",
        f"ip access-list extended {acl_name}",
        f" remark [SAFETY] Permit established management sessions",
        f" permit tcp 192.168.100.0 0.0.0.255 any eq 22",
        f" permit tcp 192.168.100.0 0.0.0.255 any eq 8000",
        f" permit udp any any eq domain"
    ]

    action_word = "deny" if intent.action in ("deny", "isolate") else "permit"
    log_word = " log" if intent.log else ""

    # Source specification in Cisco wildcard mask format
    src_spec = "any"
    if intent.source.type == "zone":
        src_z = lookup_zone(intent.source.ref)
        if src_z and src_z.get("cidr") and "/" in src_z["cidr"]:
            ip_base, mask_bits = src_z["cidr"].split("/")
            if mask_bits == "24":
                src_spec = f"{ip_base} 0.0.0.255"
    elif intent.source.type == "host":
        src_spec = f"host {intent.source.ref}"

    rule_count = 0
    if intent.destination.type == "service":
        svc = lookup_service(intent.destination.ref)
        mock_ips = svc.get("mock_ips", ["142.250.190.46"]) if svc else ["any"]
        ports = svc.get("ports", [443]) if svc else [443]
        for ip in mock_ips:
            dst_spec = f"host {ip}" if ip != "any" else "any"
            for p in ports:
                rule_count += 1
                lines.append(f" {action_word} tcp {src_spec} {dst_spec} eq {p}{log_word}")
            if svc and svc.get("quic_relevant"):
                rule_count += 1
                lines.append(f" {action_word} udp {src_spec} {dst_spec} eq 443{log_word}")
    else:
        dst_spec = "any"
        if intent.destination.type == "zone":
            dst_z = lookup_zone(intent.destination.ref)
            if dst_z and dst_z.get("cidr") and "/" in dst_z["cidr"]:
                ip_base, mask_bits = dst_z["cidr"].split("/")
                if mask_bits == "24":
                    dst_spec = f"{ip_base} 0.0.0.255"
        elif intent.destination.type == "host":
            dst_spec = f"host {intent.destination.ref}"

        rule_count += 1
        lines.append(f" {action_word} ip {src_spec} {dst_spec}{log_word}")

    lines.append(" permit ip any any")
    return "\n".join(lines), rule_count
