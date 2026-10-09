"""
iptables (Legacy) Compiler for Intentwall
Generates iptables-restore formatted rule files with custom user-chains.
"""

from typing import List, Tuple
from apps.api.ir.models import FirewallIntentIR
from apps.api.compile.services import lookup_service, lookup_zone


def compile_to_iptables(intent: FirewallIntentIR, policy_version_id: str = "v1") -> Tuple[str, int]:
    """
    Compiles IR to iptables-save/restore syntax.
    """
    lines: List[str] = [
        "*filter",
        ":INPUT ACCEPT [0:0]",
        ":FORWARD ACCEPT [0:0]",
        ":OUTPUT ACCEPT [0:0]",
        f":INTENTWALL_{intent.intent_id} - [0:0]",
        "# Management plane safety invariants",
        "-A INPUT -i lo -j ACCEPT",
        "-A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT",
        "-A INPUT -p tcp --dport 22 -j ACCEPT -m comment --comment \"Lockout Guard: SSH\"",
        "-A INPUT -p tcp --dport 8000 -j ACCEPT -m comment --comment \"Lockout Guard: API\"",
        "-A INPUT -p udp --dport 53 -j ACCEPT -m comment --comment \"Gateway DNS\"",
        "-A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT",
        f"-A FORWARD -j INTENTWALL_{intent.intent_id}"
    ]

    # Resolve source CIDR
    src_arg = ""
    if intent.source.type == "zone":
        src_z = lookup_zone(intent.source.ref)
        if src_z and src_z.get("cidr") and src_z["cidr"] != "0.0.0.0/0":
            src_arg = f"-s {src_z['cidr']}"
    elif intent.source.type == "host":
        src_arg = f"-s {intent.source.ref}"
    elif intent.source.type == "subnet":
        src_arg = f"-s {intent.source.cidr or intent.source.ref}"

    # Target verdict
    target = "DROP" if intent.action in ("deny", "isolate") else "ACCEPT"
    rule_count = 0

    if intent.destination.type == "service":
        svc = lookup_service(intent.destination.ref)
        mock_ips = svc.get("mock_ips", ["142.250.190.46"]) if svc else ["0.0.0.0/0"]
        ports = svc.get("ports", [443]) if svc else [443]
        for ip in mock_ips:
            for p in ports:
                rule_count += 1
                lines.append(
                    f"-A INTENTWALL_{intent.intent_id} {src_arg} -d {ip} -p tcp --dport {p} -j {target} "
                    f"-m comment --comment \"{intent.intent_id}: {intent.destination.ref} TCP/{p}\""
                )
            if svc and svc.get("quic_relevant"):
                rule_count += 1
                lines.append(
                    f"-A INTENTWALL_{intent.intent_id} {src_arg} -d {ip} -p udp --dport 443 -j {target} "
                    f"-m comment --comment \"{intent.intent_id}: {intent.destination.ref} QUIC UDP/443\""
                )
    else:
        dst_arg = ""
        if intent.destination.type == "zone":
            dst_z = lookup_zone(intent.destination.ref)
            if dst_z and dst_z.get("cidr") and dst_z["cidr"] != "0.0.0.0/0":
                dst_arg = f"-d {dst_z['cidr']}"
        elif intent.destination.type in ("host", "subnet"):
            dst_arg = f"-d {intent.destination.cidr or intent.destination.ref}"

        rule_count += 1
        lines.append(
            f"-A INTENTWALL_{intent.intent_id} {src_arg} {dst_arg} -j {target} "
            f"-m comment --comment \"{intent.intent_id}: {intent.explanation}\""
        )

    lines.append("COMMIT")
    return "\n".join(lines), rule_count
