#!/bin/bash
echo "=== IPv4 Adresi ==="
curl -4 -s ifconfig.me
echo ""
echo "=== IPv6 Adresi ==="
curl -6 -s ifconfig.me
echo ""
