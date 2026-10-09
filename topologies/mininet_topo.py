"""
Intentwall Mininet Emulation Topology
Multi-Zone Network Topology with Gateway Firewall, Guest Wi-Fi, Staff,
Server farm, Management Bastion, and Mock Internet Endpoints.

Run on Linux with root:
    sudo python3 topologies/mininet_topo.py
"""

import sys
import time

try:
    from mininet.net import Mininet
    from mininet.node import Controller, Node
    from mininet.cli import CLI
    from mininet.log import setLogLevel, info
except ImportError:
    # Allow import for documentation or linting when mininet is not installed locally
    Mininet = None


class LinuxRouter(Node):
    """A Node with IP forwarding enabled, acting as the Linux firewall gateway."""
    def config(self, **params):
        super(LinuxRouter, self).config(**params)
        self.cmd('sysctl net.ipv4.ip_forward=1')

    def terminate(self):
        self.cmd('sysctl net.ipv4.ip_forward=0')
        super(LinuxRouter, self).terminate()


def build_and_run_topology():
    if Mininet is None:
        print("Mininet is not installed in this environment. Run on Linux VM with sudo.")
        sys.exit(1)

    setLogLevel('info')
    net = Mininet(controller=None)

    info('*** Adding Gateway Firewall Router\n')
    gw = net.addHost('gw', cls=LinuxRouter, ip='10.10.1.1/24')

    info('*** Adding Zone Hosts\n')
    guest1 = net.addHost('guest1', ip='10.10.20.101/24', defaultRoute='via 10.10.20.1')
    staff1 = net.addHost('staff1', ip='10.10.10.50/24', defaultRoute='via 10.10.10.1')
    srv1 = net.addHost('srv1', ip='10.10.30.10/24', defaultRoute='via 10.10.30.1')
    mgmt1 = net.addHost('mgmt1', ip='192.168.100.10/24', defaultRoute='via 192.168.100.1')
    wan = net.addHost('wan', ip='203.0.113.10/24', defaultRoute='via 203.0.113.1')

    info('*** Creating Links\n')
    net.addLink(guest1, gw, intfName2='eth-guest', params2={'ip': '10.10.20.1/24'})
    net.addLink(staff1, gw, intfName2='eth-staff', params2={'ip': '10.10.10.1/24'})
    net.addLink(srv1, gw, intfName2='eth-srv', params2={'ip': '10.10.30.1/24'})
    net.addLink(mgmt1, gw, intfName2='eth-mgmt', params2={'ip': '192.168.100.1/24'})
    net.addLink(wan, gw, intfName2='eth-wan', params2={'ip': '203.0.113.1/24'})

    info('*** Starting Network\n')
    net.start()

    info('*** Configuring Mock Internet & Local DNS\n')
    # Run a mock web service on wan host representing YouTube / Wikipedia
    wan.cmd('python3 -m http.server 443 &')
    wan.cmd('python3 -m http.server 80 &')
    srv1.cmd('python3 -m http.server 80 &')

    info('*** Gateway Router is Ready for nftables policy injection\n')
    info('*** Available hosts: guest1, staff1, srv1, mgmt1, wan, gw\n')

    CLI(net)
    net.stop()


if __name__ == '__main__':
    build_and_run_topology()
