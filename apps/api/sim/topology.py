"""
Topology Definition and State for Intentwall
Provides both graphical representation and network addresses for simulation.
"""

from typing import Dict, List, Any

DEFAULT_TOPOLOGY: Dict[str, Any] = {
    "id": "office_enterprise_v1",
    "name": "Standard Enterprise Multi-Zone Topology",
    "nodes": [
        {
            "id": "wan",
            "type": "cloud",
            "label": "Internet / WAN",
            "cidr": "0.0.0.0/0",
            "status": "online",
            "icon": "globe",
            "endpoints": [
                {"name": "youtube.com", "ip": "142.250.190.46", "port": 443},
                {"name": "netflix.com", "ip": "198.38.118.140", "port": 443},
                {"name": "wikipedia.org", "ip": "198.35.26.96", "port": 443}
            ]
        },
        {
            "id": "gateway",
            "type": "firewall",
            "label": "Intentwall Core Gateway",
            "ip": "10.10.1.1",
            "status": "enforcing",
            "icon": "shield",
            "engine": "nftables"
        },
        {
            "id": "guest",
            "type": "zone",
            "label": "Guest Wi-Fi (VLAN 20)",
            "cidr": "10.10.20.0/24",
            "status": "restricted",
            "icon": "users",
            "hosts": [
                {"id": "h-guest-1", "name": "guest-laptop-1", "ip": "10.10.20.101"},
                {"id": "h-guest-2", "name": "guest-phone-2", "ip": "10.10.20.102"}
            ]
        },
        {
            "id": "staff",
            "type": "zone",
            "label": "Staff Workstations (VLAN 10)",
            "cidr": "10.10.10.0/24",
            "status": "trusted",
            "icon": "briefcase",
            "hosts": [
                {"id": "h-staff-1", "name": "staff-workstation-1", "ip": "10.10.10.50"}
            ]
        },
        {
            "id": "servers",
            "type": "zone",
            "label": "Internal Servers (VLAN 30)",
            "cidr": "10.10.30.0/24",
            "status": "secure",
            "icon": "server",
            "hosts": [
                {"id": "h-srv-1", "name": "intranet-portal", "ip": "10.10.30.10", "port": 80},
                {"id": "h-srv-2", "name": "prod-db-node", "ip": "10.10.30.20", "port": 5432}
            ]
        },
        {
            "id": "mgmt",
            "type": "zone",
            "label": "Management Bastion (VLAN 100)",
            "cidr": "192.168.100.0/24",
            "status": "critical",
            "icon": "lock",
            "hosts": [
                {"id": "h-admin-1", "name": "admin-bastion", "ip": "192.168.100.10"}
            ]
        }
    ],
    "links": [
        {"source": "guest", "target": "gateway", "label": "eth-guest (VLAN 20)"},
        {"source": "staff", "target": "gateway", "label": "eth-staff (VLAN 10)"},
        {"source": "servers", "target": "gateway", "label": "eth-srv (VLAN 30)"},
        {"source": "mgmt", "target": "gateway", "label": "eth-mgmt (VLAN 100)"},
        {"source": "gateway", "target": "wan", "label": "eth-wan (Uplink)"}
    ]
}


def get_topology_definition() -> Dict[str, Any]:
    return DEFAULT_TOPOLOGY
