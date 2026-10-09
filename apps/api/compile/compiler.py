"""
Multi-Target Compiler Coordinator for Intentwall
Compiles IR to nftables, iptables, and Cisco ACL, validating syntax and generating diff metadata.
"""

from apps.api.ir.models import FirewallIntentIR, CompiledRuleset
from apps.api.compile.nftables import compile_to_nftables
from apps.api.compile.iptables import compile_to_iptables
from apps.api.compile.cisco_acl import compile_to_cisco_acl


def compile_policy(intent: FirewallIntentIR, policy_version_id: str = "v1") -> CompiledRuleset:
    """
    Coordinates compilation of IR across all targets.
    """
    nft_text, nft_meta = compile_to_nftables(intent, policy_version_id)
    ipt_text, ipt_count = compile_to_iptables(intent, policy_version_id)
    cisco_text, cisco_count = compile_to_cisco_acl(intent)

    total_rules = nft_meta.get("rule_count", 1)

    summary = (
        f"Compiled {total_rules} rule(s) targeting {intent.source.ref} -> {intent.destination.ref} "
        f"with action '{intent.action.upper()}'."
    )

    return CompiledRuleset(
        nftables=nft_text,
        iptables=ipt_text,
        cisco_acl=cisco_text,
        tables_json={
            "rules_count": total_rules,
            "table_name": nft_meta.get("table", "inet intentwall_filter"),
            "set_name": nft_meta.get("set_name")
        },
        applied_rules_count=total_rules,
        summary=summary
    )
