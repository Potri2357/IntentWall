"""
Service Catalog and Network Inventory for Intentwall
Defines well-known services, zones, subnets, and host mappings.
"""

from typing import Dict, List, Any, Optional

# Predefined service definitions with domains, ports, QUIC requirements
SERVICE_CATALOG: Dict[str, Dict[str, Any]] = {
    "youtube": {
        "name": "YouTube",
        "description": "YouTube video streaming, Google Video CDN, and Shorts",
        "domains": [
            "youtube.com",
            "www.youtube.com",
            "googlevideo.com",
            "ytimg.com",
            "youtu.be",
            "youtubei.googleapis.com"
        ],
        "ports": [443, 80],
        "protocols": ["tcp", "udp"],  # UDP 443 for QUIC
        "category": "Streaming / Media",
        "quic_relevant": True,
        "mock_ips": ["142.250.190.46", "172.217.16.206", "216.58.214.206"]
    },
    "netflix": {
        "name": "Netflix",
        "description": "Netflix media streaming and Open Connect CDN",
        "domains": [
            "netflix.com",
            "www.netflix.com",
            "nflxvideo.net",
            "nflximg.net",
            "nflxext.com"
        ],
        "ports": [443, 80],
        "protocols": ["tcp"],
        "category": "Streaming / Media",
        "quic_relevant": False,
        "mock_ips": ["198.38.118.140", "198.38.119.140"]
    },
    "facebook": {
        "name": "Facebook",
        "description": "Meta Facebook social network and CDN",
        "domains": ["facebook.com", "www.facebook.com", "fbcdn.net", "fbsbx.com"],
        "ports": [443, 80],
        "protocols": ["tcp", "udp"],
        "category": "Social Media",
        "quic_relevant": True,
        "mock_ips": ["157.240.22.35", "31.13.72.36"]
    },
    "instagram": {
        "name": "Instagram",
        "description": "Instagram photos, reels, and messaging",
        "domains": ["instagram.com", "www.instagram.com", "cdninstagram.com"],
        "ports": [443, 80],
        "protocols": ["tcp", "udp"],
        "category": "Social Media",
        "quic_relevant": True,
        "mock_ips": ["157.240.241.174", "31.13.71.174"]
    },
    "tiktok": {
        "name": "TikTok",
        "description": "TikTok short videos and live streams",
        "domains": ["tiktok.com", "www.tiktok.com", "tiktokcdn.com", "byteoversea.com"],
        "ports": [443, 80],
        "protocols": ["tcp", "udp"],
        "category": "Social Media",
        "quic_relevant": True,
        "mock_ips": ["161.117.70.145"]
    },
    "spotify": {
        "name": "Spotify",
        "description": "Spotify music and podcast streaming",
        "domains": ["spotify.com", "www.spotify.com", "scdn.co", "spoti.fi"],
        "ports": [443, 80, 4070],
        "protocols": ["tcp"],
        "category": "Streaming / Music",
        "quic_relevant": False,
        "mock_ips": ["35.186.224.25"]
    },
    "whatsapp": {
        "name": "WhatsApp",
        "description": "WhatsApp messaging, calling, and web client",
        "domains": ["whatsapp.com", "web.whatsapp.com", "whatsapp.net"],
        "ports": [443, 80, 5222, 3478],
        "protocols": ["tcp", "udp"],
        "category": "Messaging",
        "quic_relevant": False,
        "mock_ips": ["157.240.241.60"]
    },
    "discord": {
        "name": "Discord",
        "description": "Discord voice, video, and text communication",
        "domains": ["discord.com", "gateway.discord.gg", "cdn.discordapp.com"],
        "ports": [443, 80, 50001, 50002],
        "protocols": ["tcp", "udp"],
        "category": "Gaming / Chat",
        "quic_relevant": False,
        "mock_ips": ["162.159.135.232"]
    },
    "zoom": {
        "name": "Zoom",
        "description": "Zoom video conferencing and meetings",
        "domains": ["zoom.us", "zoomgov.com"],
        "ports": [443, 80, 8801, 8802],
        "protocols": ["tcp", "udp"],
        "category": "Conferencing",
        "quic_relevant": False,
        "mock_ips": ["170.114.10.12"]
    },
    "wikipedia": {
        "name": "Wikipedia",
        "description": "Wikimedia educational content and reference",
        "domains": ["wikipedia.org", "wikimedia.org"],
        "ports": [443, 80],
        "protocols": ["tcp"],
        "category": "Reference / Web",
        "quic_relevant": False,
        "mock_ips": ["198.35.26.96"]
    }
}

# Network zones definition
DEFAULT_ZONES: Dict[str, Dict[str, Any]] = {
    "guest": {
        "name": "Guest Network",
        "cidr": "10.10.20.0/24",
        "vlan": 20,
        "interface": "eth-guest",
        "role": "guest",
        "gateway": "10.10.20.1",
        "sample_hosts": [
            {"name": "guest-laptop-1", "ip": "10.10.20.101"},
            {"name": "guest-phone-2", "ip": "10.10.20.102"}
        ]
    },
    "staff": {
        "name": "Staff Network",
        "cidr": "10.10.10.0/24",
        "vlan": 10,
        "interface": "eth-staff",
        "role": "staff",
        "gateway": "10.10.10.1",
        "sample_hosts": [
            {"name": "staff-workstation-1", "ip": "10.10.10.50"},
            {"name": "staff-workstation-2", "ip": "10.10.10.51"}
        ]
    },
    "servers": {
        "name": "Internal Server Farm",
        "cidr": "10.10.30.0/24",
        "vlan": 30,
        "interface": "eth-srv",
        "role": "server",
        "gateway": "10.10.30.1",
        "sample_hosts": [
            {"name": "intranet-web", "ip": "10.10.30.10"},
            {"name": "db-server", "ip": "10.10.30.20"}
        ]
    },
    "mgmt": {
        "name": "Management Network",
        "cidr": "192.168.100.0/24",
        "vlan": 100,
        "interface": "eth-mgmt",
        "role": "mgmt",
        "gateway": "192.168.100.1",
        "sample_hosts": [
            {"name": "admin-bastion", "ip": "192.168.100.10"},
            {"name": "gateway-controller", "ip": "192.168.100.1"}
        ]
    },
    "internet": {
        "name": "WAN / Internet",
        "cidr": "0.0.0.0/0",
        "vlan": 0,
        "interface": "eth-wan",
        "role": "external",
        "gateway": "203.0.113.1",
        "sample_hosts": []
    }
}


def lookup_service(name: str) -> Optional[Dict[str, Any]]:
    """Case-insensitive service lookup."""
    clean = name.strip().lower()
    return SERVICE_CATALOG.get(clean)


def lookup_zone(name: str) -> Optional[Dict[str, Any]]:
    """Case-insensitive zone lookup."""
    clean = name.strip().lower()
    for zkey, zval in DEFAULT_ZONES.items():
        if zkey == clean or zval["name"].lower() == clean:
            return zval
    return None
