"""
Intentwall Intermediate Representation (IR) Models
Strict Pydantic v2 schemas representing firewall intent independent of target syntax.
"""

from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field


class EndpointRef(BaseModel):
    """Reference to a source or destination endpoint."""
    type: Literal["zone", "host", "subnet", "service", "any"] = Field(
        ..., description="Type of network entity"
    )
    ref: str = Field(
        ..., description="Identifier name or CIDR/IP, e.g. 'guest', '10.10.20.5', 'youtube'"
    )
    cidr: Optional[str] = Field(None, description="Resolved CIDR if applicable")


class ProtocolPort(BaseModel):
    """Protocol and port specification."""
    proto: Literal["tcp", "udp", "icmp", "all"] = Field("tcp", description="Layer 4 protocol")
    port: Optional[Union[int, str]] = Field(None, description="Port number or range like '8000-8080'")


class ScheduleSpec(BaseModel):
    """Time-schedule restriction."""
    days: List[str] = Field(default_factory=lambda: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"])
    start_time: str = Field("00:00", description="HH:MM in 24h format")
    end_time: str = Field("23:59", description="HH:MM in 24h format")


class RateLimitSpec(BaseModel):
    """Rate-limiting specification."""
    rate: int = Field(100, description="Rate limit count")
    unit: Literal["second", "minute", "hour"] = Field("minute", description="Time unit")
    burst: Optional[int] = Field(20, description="Burst packet count")


class FirewallIntentIR(BaseModel):
    """
    Typed Intermediate Representation (IR) generated from LLM or deterministic parser.
    """
    intent_id: str = Field(..., description="Unique policy/intent identifier")
    action: Literal["deny", "allow", "rate-limit", "isolate", "log-only"] = Field(
        ..., description="Enforcement action"
    )
    source: EndpointRef = Field(..., description="Source zone, host, or subnet")
    destination: EndpointRef = Field(..., description="Destination zone, host, service, or 'any'")
    protocols: List[ProtocolPort] = Field(
        default_factory=list, description="Target protocols and ports"
    )
    direction: Literal["inbound", "outbound", "forward", "both"] = Field(
        "outbound", description="Traffic direction"
    )
    schedule: Optional[ScheduleSpec] = Field(None, description="Optional time scheduling")
    rate_limit: Optional[RateLimitSpec] = Field(None, description="Optional rate limit")
    log: bool = Field(True, description="Enable rule match logging")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score 0.0-1.0")
    explanation: str = Field(..., description="Plain-English explanation of parsed intent")
    ambiguities: List[str] = Field(default_factory=list, description="Any identified ambiguities or assumptions")


class ValidationIssue(BaseModel):
    severity: Literal["info", "warning", "error", "critical"]
    code: str
    message: str
    suggested_fix: Optional[str] = None


class ValidationReport(BaseModel):
    valid: bool
    risk_level: Literal["low", "medium", "high", "critical"]
    risk_score: int = Field(ge=0, le=100)
    blast_radius: Dict[str, Any] = Field(
        default_factory=lambda: {
            "affected_zones": [],
            "estimated_hosts": 0,
            "estimated_flows": "low"
        }
    )
    issues: List[ValidationIssue] = Field(default_factory=list)
    lockout_safe: bool = True
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)


class CompiledRuleset(BaseModel):
    nftables: str
    iptables: str
    cisco_acl: str
    tables_json: Optional[Dict[str, Any]] = None
    applied_rules_count: int
    summary: str


class ProbeTest(BaseModel):
    id: str
    name: str
    category: Literal["positive", "negative", "regression", "management"]
    source_host: str
    source_ip: str
    destination_target: str
    destination_ip_or_domain: str
    port: int
    protocol: str
    expected_outcome: Literal["allow", "block"]
    description: str


class ProbeExecutionResult(BaseModel):
    test_id: str
    name: str
    category: str
    command: str
    expected: str
    actual: Literal["allow", "block", "error", "timeout"]
    passed: bool
    evidence: str
    latency_ms: float
    timestamp: str
    packet_trace: Optional[List[str]] = None
