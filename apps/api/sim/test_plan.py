"""
Automated Test Plan Generator for Intentwall
Derives positive, negative, regression, and management safety probes directly from the IR.
"""

from typing import List
from apps.api.ir.models import FirewallIntentIR, ProbeTest
from apps.api.compile.services import lookup_service, lookup_zone


def generate_test_plan(intent: FirewallIntentIR) -> List[ProbeTest]:
    """
    Creates an automated verification test plan based on intent and network topology.
    """
    tests: List[ProbeTest] = []
    src_zone_ref = intent.source.ref.lower()
    dst_ref = intent.destination.ref.lower()

    # Determine source host and IP
    if src_zone_ref == "guest":
        src_host = "guest-laptop-1"
        src_ip = "10.10.20.101"
    elif src_zone_ref == "staff":
        src_host = "staff-workstation-1"
        src_ip = "10.10.10.50"
    elif src_zone_ref == "servers":
        src_host = "intranet-portal"
        src_ip = "10.10.30.10"
    else:
        src_host = f"{src_zone_ref}-host"
        src_ip = "10.10.20.100"

    expected_target_outcome = "block" if intent.action in ("deny", "isolate") else "allow"

    # 1. Target Probes (Negative/Positive depending on action)
    if intent.destination.type == "service":
        svc = lookup_service(dst_ref)
        domain = svc["domains"][0] if svc else f"{dst_ref}.com"
        target_ip = svc["mock_ips"][0] if svc else "142.250.190.46"

        tests.append(ProbeTest(
            id="t-target-https",
            name=f"{src_host} -> {domain} (HTTPS TCP/443)",
            category="negative" if expected_target_outcome == "block" else "positive",
            source_host=src_host,
            source_ip=src_ip,
            destination_target=domain,
            destination_ip_or_domain=target_ip,
            port=443,
            protocol="tcp",
            expected_outcome=expected_target_outcome,
            description=f"Verify {src_host} traffic to {domain} over HTTPS TCP/443."
        ))

        if svc and svc.get("quic_relevant"):
            tests.append(ProbeTest(
                id="t-target-quic",
                name=f"{src_host} -> {domain} (QUIC UDP/443)",
                category="negative" if expected_target_outcome == "block" else "positive",
                source_host=src_host,
                source_ip=src_ip,
                destination_target=domain,
                destination_ip_or_domain=target_ip,
                port=443,
                protocol="udp",
                expected_outcome=expected_target_outcome,
                description=f"Verify UDP/443 QUIC stream to prevent protocol bypass."
            ))

        # Positive probe from an unaffected zone (e.g. staff)
        if src_zone_ref != "staff":
            tests.append(ProbeTest(
                id="t-staff-control",
                name=f"staff-workstation-1 -> {domain} (HTTPS)",
                category="positive",
                source_host="staff-workstation-1",
                source_ip="10.10.10.50",
                destination_target=domain,
                destination_ip_or_domain=target_ip,
                port=443,
                protocol="tcp",
                expected_outcome="allow",
                description=f"Verify staff network access to {domain} remains allowed."
            ))

    elif intent.destination.type in ("zone", "host", "subnet"):
        dst_z = lookup_zone(dst_ref)
        dst_ip = dst_z.get("gateway", "10.10.30.10") if dst_z else "10.10.30.10"
        tests.append(ProbeTest(
            id="t-target-interzone",
            name=f"{src_host} -> {dst_ref} ({dst_ip})",
            category="negative" if expected_target_outcome == "block" else "positive",
            source_host=src_host,
            source_ip=src_ip,
            destination_target=dst_ref,
            destination_ip_or_domain=dst_ip,
            port=80,
            protocol="tcp",
            expected_outcome=expected_target_outcome,
            description=f"Verify inter-zone routing from {src_host} to {dst_ref}."
        ))

    # 2. Regression Probes (Ensure other traffic didn't break)
    tests.append(ProbeTest(
        id="t-regr-external",
        name=f"{src_host} -> wikipedia.org (HTTPS)",
        category="regression",
        source_host=src_host,
        source_ip=src_ip,
        destination_target="wikipedia.org",
        destination_ip_or_domain="198.35.26.96",
        port=443,
        protocol="tcp",
        expected_outcome="allow",
        description="Verify legitimate web traffic outside the policy target is uninhibited."
    ))

    # 3. Gateway DNS Health Probe
    tests.append(ProbeTest(
        id="t-regr-dns",
        name=f"{src_host} -> Gateway DNS (UDP/53)",
        category="regression",
        source_host=src_host,
        source_ip=src_ip,
        destination_target="gateway-dns",
        destination_ip_or_domain="10.10.1.1",
        port=53,
        protocol="udp",
        expected_outcome="allow",
        description="Verify DNS resolution to the gateway remains operational."
    ))

    # 4. Management Plane Lockout Probe
    tests.append(ProbeTest(
        id="t-mgmt-ssh",
        name="admin-bastion -> Gateway SSH (TCP/22)",
        category="management",
        source_host="admin-bastion",
        source_ip="192.168.100.10",
        destination_target="gateway",
        destination_ip_or_domain="192.168.100.1",
        port=22,
        protocol="tcp",
        expected_outcome="allow",
        description="Verify administrative SSH to the gateway controller is never blocked."
    ))

    # 5. Controller API Probe
    tests.append(ProbeTest(
        id="t-mgmt-api",
        name="admin-bastion -> Controller REST API (TCP/8000)",
        category="management",
        source_host="admin-bastion",
        source_ip="192.168.100.10",
        destination_target="gateway-api",
        destination_ip_or_domain="192.168.100.1",
        port=8000,
        protocol="tcp",
        expected_outcome="allow",
        description="Verify Intentwall REST API health probe."
    ))

    return tests
