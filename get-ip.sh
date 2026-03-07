#!/bin/bash
echo "=== Sunucu IP Adresi ==="
curl -s ifconfig.me
echo ""
echo "=== Backend direkt test ==="
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ahmetcansertce@hotmail.com","password":"123456"}'
echo ""
