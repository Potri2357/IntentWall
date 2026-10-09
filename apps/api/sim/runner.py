"""
Simulation and Probe Execution Runner for Intentwall
Executes generated probe test plans, simulates live packet transmission,
records command execution traces, latency, and streams results.
"""

import asyncio
import time
import random
from datetime import datetime
from typing import List, AsyncGenerator
from apps.api.ir.models import FirewallIntentIR, ProbeTest, ProbeExecutionResult
from apps.api.compile.services import lookup_service


async def execute_probe(test: ProbeTest, intent: FirewallIntentIR) -> ProbeExecutionResult:
    """
    Simulates the execution of a single network probe in the topology sandbox.
    Generates realistic CLI commands, latency, and detailed packet traces.
    """
    # Artificial small latency for realistic live streaming
    delay = random.uniform(0.15, 0.45)
    await asyncio.sleep(delay)

    is_quic = test.protocol == "udp" and test.port == 443
    is_dns = test.protocol == "udp" and test.port == 53
    is_ssh = test.protocol == "tcp" and test.port == 22

    # Synthesize realistic command
    if is_dns:
        cmd = f"dig @{test.destination_ip_or_domain} {test.destination_target} +time=1 +tries=1"
    elif is_quic:
        cmd = f"quiche-client --no-verify https://{test.destination_target}:{test.port}/"
    elif test.protocol == "tcp" and test.port in (80, 443):
        scheme = "https" if test.port == 443 else "http"
        cmd = f"curl -Iv --connect-timeout 2 --max-time 3 {scheme}://{test.destination_target}"
    else:
        cmd = f"nc -zv -w 2 {test.destination_ip_or_domain} {test.port}"

    # Determine whether policy blocks this packet
    src_match = (
        intent.source.ref.lower() in test.source_host.lower() or
        intent.source.ref.lower() in test.source_ip
    )
    dst_match = False

    if intent.destination.type == "service":
        svc = lookup_service(intent.destination.ref)
        if svc:
            dst_match = (
                any(d in test.destination_target.lower() for d in svc.get("domains", [])) or
                test.destination_ip_or_domain in svc.get("mock_ips", [])
            )
    elif intent.destination.type in ("zone", "host", "subnet"):
        dst_match = intent.destination.ref.lower() in test.destination_target.lower()
    elif intent.destination.ref.lower() == "any":
        dst_match = True

    # Lockout protections always keep SSH, DNS, API open
    if is_ssh or is_dns or test.port == 8000:
        blocked_by_policy = False
    elif src_match and dst_match and intent.action in ("deny", "isolate"):
        blocked_by_policy = True
    else:
        blocked_by_policy = False

    actual_outcome = "block" if blocked_by_policy else "allow"
    passed = (actual_outcome == test.expected_outcome)

    timestamp_str = datetime.utcnow().isoformat() + "Z"
    latency_ms = round(delay * 1000 + random.uniform(1.2, 5.8), 2)

    # Generate realistic execution evidence
    if actual_outcome == "allow":
        if is_dns:
            evidence = (
                f";; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 48123\n"
                f";; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n"
                f"{test.destination_target}.  300  IN  A  {test.destination_ip_or_domain}\n"
                f";; Query time: {int(latency_ms)} msec\n"
                f";; SERVER: {test.destination_ip_or_domain}#53(10.10.1.1)\n"
                f";; MSG SIZE  rcvd: 64"
            )
        elif is_ssh:
            evidence = (
                f"OpenSSH_9.6p1, LibreSSL 3.8.2\n"
                f"debug1: Connecting to {test.destination_ip_or_domain} [{test.destination_ip_or_domain}] port 22.\n"
                f"debug1: Connection established.\n"
                f"debug1: identity file /root/.ssh/id_ed25519 type 3\n"
                f"debug1: Authenticated to {test.destination_ip_or_domain} ([{test.destination_ip_or_domain}]:22)."
            )
        else:
            evidence = (
                f"* Connected to {test.destination_target} ({test.destination_ip_or_domain}) port {test.port}\n"
                f"* ALPN: offers h2, http/1.1\n"
                f"* TLSv1.3 (OUT), TLS handshake, Client hello (1):\n"
                f"* TLSv1.3 (IN), TLS handshake, Server hello (2):\n"
                f"> GET / HTTP/2\n"
                f"> Host: {test.destination_target}\n"
                f"< HTTP/2 200 OK\n"
                f"< content-type: text/html; charset=utf-8\n"
                f"< server: gws\n"
                f"* Connection #0 to host {test.destination_target} left intact"
            )
    else:
        evidence = (
            f"* Connecting to {test.destination_target} ({test.destination_ip_or_domain}) port {test.port}...\n"
            f"* [nftables verdict] drop: matched table inet intentwall_filter chain forward\n"
            f"* iptables / nftables DROP packet counter incremented: cnt_{intent.intent_id}\n"
            f"* connect to {test.destination_ip_or_domain} port {test.port} failed: Connection timed out\n"
            f"* Failed to connect to {test.destination_target} port {test.port} after {int(latency_ms)}ms: Timeout\n"
            f"curl: (28) Failed to connect to {test.destination_target} port {test.port}: Connection timed out"
        )

    packet_trace = [
        f"SYN [{test.source_ip}:{random.randint(40000, 60000)} -> {test.destination_ip_or_domain}:{test.port}]",
        f"INGRESS eth-gateway: evaluate chain forward hook priority 0",
        f"VERDICT: {'DROP (policy rule matched)' if blocked_by_policy else 'ACCEPT (stateful forward)'}",
        f"STATUS: {'PACKET_DROPPED' if blocked_by_policy else 'SYN-ACK RECEIVED'}"
    ]

    return ProbeExecutionResult(
        test_id=test.id,
        name=test.name,
        category=test.category,
        command=cmd,
        expected=test.expected_outcome,
        actual=actual_outcome,
        passed=passed,
        evidence=evidence,
        latency_ms=latency_ms,
        timestamp=timestamp_str,
        packet_trace=packet_trace
    )


async def run_simulation_stream(
    tests: List[ProbeTest],
    intent: FirewallIntentIR
) -> AsyncGenerator[ProbeExecutionResult, None]:
    """
    Executes the entire test plan sequentially and yields each result as it completes.
    """
    for test in tests:
        res = await execute_probe(test, intent)
        yield res
