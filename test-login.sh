#!/bin/bash
echo "Backend login testi..."
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmetcansertce@hotmail.com","password":"123456"}'
echo ""
echo "Sonuc yukarida. access_token gorunduyse BASARILI!"
