"""
nftables Compiler for Intentwall
Compiles typed FirewallIntentIR to idiomatic Linux nftables configuration.
Includes sets for domain IPs, stateful connection tracking, and packet counters.
"""

from typing import List, Dict, Any, Tuple
from apps.api.ir.models import FirewallIntentIR
from apps.api.compile.services import lookup_service, lookup_zone


def compile_to_nftables(intent: FirewallIntentIR, policy_version_id: str = "v1") -> Tuple[str, Dict[str, Any]]:
    """
    Translates IR into structured Linux nftables configuration.
    Returns (ruleset_text, metadata_dict).
    """
    lines: List[str] = []
    lines.append("#!/usr/sbin/nft -f")
    lines.append(f"# Intentwall Generated nftables Policy [{intent.intent_id} - {policy_version_id}]")
    lines.append(f"# Explanation: {intent.explanation}")
    lines.append(f"# Confidence: {int(intent.confidence * 100)}% | Action: {intent.action.upper()}")
    lines.append("")
    lines.append("table inet intentwall_filter {")

    # Define sets if destination is a service or multiple IPs
    set_name = None
    if intent.destination.type == "service":
        svc = lookup_service(intent.destination.ref)
        if svc:
            set_name = f"svc_{intent.destination.ref.lower()}_ips"
            ips_str = ", ".join(svc.get("mock_ips", ["142.250.190.46"]))
            lines.append(f"    set {set_name} {{")
            lines.append("        type ipv4_addr")
            lines.append("        flags interval, timeout")
            lines.append(f"        elements = {{ {ips_str} }}")
            lines.append("    }")
            lines.append("")

    # Base chains
    lines.append("    chain input {")
    lines.append("        type filter hook input priority 0; policy accept;")
    lines.append("        # Management plane protection - always preserve SSH, DNS, API")
    lines.append("        iif \"lo\" accept")
    lines.append("        ct state established,related accept")
    lines.append("        tcp dport 22 accept comment \"Intentwall Lockout Guard: SSH\"")
    lines.append("        tcp dport 8000 accept comment \"Intentwall Lockout Guard: Controller API\"")
    lines.append("        udp dport 53 accept comment \"Gateway DNS resolver\"")
    lines.append("        udp dport { 67, 68 } accept comment \"DHCP\"")
    lines.append("    }")
    lines.append("")

    lines.append("    chain forward {")
    lines.append("        type filter hook forward priority 0; policy accept;")
    lines.append("        # Allow established and related traffic")
    lines.append("        ct state established,related accept")
    lines.append("        ct state invalid drop")
    lines.append("")

    # Resolve source match
    src_match = ""
    if intent.source.type == "zone":
        src_zone = lookup_zone(intent.source.ref)
        if src_zone and src_zone.get("cidr") and src_zone["cidr"] != "0.0.0.0/0":
            src_match = f"ip saddr {src_zone['cidr']}"
        elif src_zone and src_zone.get("interface"):
            src_match = f"iifname \"{src_zone['interface']}\""
        else:
            src_match = f"# zone:{intent.source.ref}"
    elif intent.source.type == "host":
        src_match = f"ip saddr {intent.source.ref}"
    elif intent.source.type == "subnet":
        src_match = f"ip saddr {intent.source.cidr or intent.source.ref}"

    # Resolve destination match
    dst_match = ""
    if set_name:
        dst_match = f"ip daddr @{set_name}"
    elif intent.destination.type == "zone":
        dst_zone = lookup_zone(intent.destination.ref)
        if dst_zone and dst_zone.get("cidr") and dst_zone["cidr"] != "0.0.0.0/0":
            dst_match = f"ip daddr {dst_zone['cidr']}"
        elif dst_zone and dst_zone.get("interface"):
            dst_match = f"oifname \"{dst_zone['interface']}\""
    elif intent.destination.type == "host":
        dst_match = f"ip daddr {intent.destination.ref}"
    elif intent.destination.type == "subnet":
        dst_match = f"ip daddr {intent.destination.cidr or intent.destination.ref}"

    # Target verdict
    if intent.action == "deny":
        verdict = "drop"
    elif intent.action == "allow":
        verdict = "accept"
    elif intent.action == "isolate":
        verdict = "drop"
    elif intent.action == "log-only":
        verdict = "continue"
    elif intent.action == "rate-limit":
        rl = intent.rate_limit
        rate_str = f"limit rate {rl.rate if rl else 100}/{rl.unit if rl else 'minute'} burst {rl.burst if rl else 20} packets"
        verdict = f"{rate_str} accept"
    else:
        verdict = "drop"

    # Assemble rule elements
    rule_parts = []
    if src_match:
        rule_parts.append(src_match)
    if dst_match:
        rule_parts.append(dst_match)

    # Protocols and ports
    proto_rules = []
    if intent.protocols:
        for p in intent.protocols:
            if p.proto in ("tcp", "udp"):
                if p.port:
                    proto_rules.append(f"{p.proto} dport {p.port}")
                else:
                    proto_rules.append(f"ip protocol {p.proto}")
            elif p.proto == "icmp":
                proto_rules.append("ip protocol icmp")
    elif intent.destination.type == "service":
        svc = lookup_service(intent.destination.ref)
        if svc:
            ports = ", ".join(str(pt) for pt in svc.get("ports", [443]))
            proto_rules.append(f"tcp dport {{ {ports} }}")
            if svc.get("quic_relevant"):
                # Also block UDP 443 for QUIC
                proto_rules.append("udp dport 443")

    if not proto_rules:
        proto_rules = [""]

    rule_counter = 0
    for pr in proto_rules:
        rule_counter += 1
        current_parts = [p for p in rule_parts if p]
        if pr:
            current_parts.append(pr)

        prefix_str = " ".join(current_parts)
        log_str = f"log prefix \"[INTENTWALL-{intent.intent_id}]: \" " if intent.log else ""
        counter_str = f"counter name \"cnt_{intent.intent_id}_{rule_counter}\" "

        rule_line = f"        {prefix_str} {counter_str}{log_str}{verdict} comment \"Policy: {intent.intent_id}\""
        lines.append(rule_line)

    lines.append("    }")
    lines.append("")
    lines.append("    chain output {")
    lines.append("        type filter hook output priority 0; policy accept;")
    lines.append("    }")
    lines.append("}")

    return "\n".join(lines), {
        "rule_count": rule_counter,
        "set_name": set_name,
        "table": "inet intentwall_filter"
    }
