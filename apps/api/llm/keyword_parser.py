"""
Rule-Based Keyword Parser for Intentwall
Provides a deterministic, zero-dependency offline fallback (Baseline A)
that parses intents using pattern matching and keyword heuristics.
"""

import re
import uuid
from typing import Optional
from apps.api.ir.models import FirewallIntentIR, EndpointRef, ProtocolPort, RateLimitSpec
from apps.api.compile.services import SERVICE_CATALOG, DEFAULT_ZONES


def parse_intent_keywords(prompt: str) -> Optional[FirewallIntentIR]:
    """
    Parses natural language requests into typed FirewallIntentIR using keyword rules.
    """
    text = prompt.lower().strip()
    intent_id = f"pol_{uuid.uuid4().hex[:6]}"

    # Determine action
    if any(k in text for k in ["block", "deny", "drop", "prevent", "restrict", "stop", "disallow"]):
        action = "deny"
    elif any(k in text for k in ["allow", "permit", "enable", "accept", "pass"]):
        action = "allow"
    elif any(k in text for k in ["isolate", "segregate", "quarantine"]):
        action = "isolate"
    elif any(k in text for k in ["rate limit", "throttle", "cap", "limit"]):
        action = "rate-limit"
    elif any(k in text for k in ["log only", "monitor", "record"]):
        action = "log-only"
    else:
        action = "deny"

    # Identify service target
    target_service = None
    for s_name in SERVICE_CATALOG.keys():
        if s_name in text:
            target_service = s_name
            break

    # Identify source zone
    source_zone = "guest"
    for z_name in DEFAULT_ZONES.keys():
        if z_name in text and z_name != target_service:
            # Check if it appears as source (e.g. "for guest", "from guest")
            source_zone = z_name
            break

    # Determine destination
    if target_service:
        destination = EndpointRef(type="service", ref=target_service)
        svc_info = SERVICE_CATALOG[target_service]
        protocols = [
            ProtocolPort(proto="tcp", port=443),
            ProtocolPort(proto="udp", port=443)  # QUIC
        ]
        explanation = f"{action.capitalize()} {source_zone} zone access to {svc_info['name']}."
        ambiguities = [f"{svc_info['name']} utilizes multiple CDN IPs; domain-based IP sets will be used."]
    else:
        # Check if destination is another zone (e.g. servers)
        dst_zone = None
        for z_name in DEFAULT_ZONES.keys():
            if z_name in text and z_name != source_zone:
                dst_zone = z_name
                break

        if dst_zone:
            destination = EndpointRef(
                type="zone",
                ref=dst_zone,
                cidr=DEFAULT_ZONES[dst_zone]["cidr"]
            )
            protocols = [ProtocolPort(proto="all", port=None)]
            explanation = f"{action.capitalize()} traffic from {source_zone} network to {dst_zone} network."
            ambiguities = []
        else:
            destination = EndpointRef(type="any", ref="any", cidr="0.0.0.0/0")
            protocols = [ProtocolPort(proto="all", port=None)]
            explanation = f"{action.capitalize()} outbound traffic from {source_zone} zone."
            ambiguities = ["Destination was not explicitly specified; assumed destination 'any'."]

    # Source endpoint
    src_cidr = DEFAULT_ZONES.get(source_zone, {}).get("cidr")
    source = EndpointRef(type="zone", ref=source_zone, cidr=src_cidr)

    # Rate limiting params
    rate_limit = None
    if action == "rate-limit":
        rate_match = re.search(r"(\d+)\s*(req|packet|reqs|packets)?\s*(per|/)?\s*(min|minute|sec|second|hour)", text)
        rate_val = int(rate_match.group(1)) if rate_match else 100
        unit_val = "second" if "sec" in text else "minute"
        rate_limit = RateLimitSpec(rate=rate_val, unit=unit_val, burst=20)

    return FirewallIntentIR(
        intent_id=intent_id,
        action=action,
        source=source,
        destination=destination,
        protocols=protocols,
        direction="outbound" if destination.type == "service" else "forward",
        schedule=None,
        rate_limit=rate_limit,
        log=True,
        confidence=0.91,
        explanation=explanation,
        ambiguities=ambiguities
    )
