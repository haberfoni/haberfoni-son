#!/bin/bash
echo "Yeni admin kullanicisi olusturuluyor..."
docker exec haberfoni_db mysql \
  -u haberfoni_user \
  -pHaberfoni_Secur3\!DB \
  haberfoni \
  -e "INSERT IGNORE INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES ('ahmetcansertce@hotmail.com', '123456', 'Admin', 'admin', 1, NOW(), NOW());"

echo "Kullanici eklendi! Test ediliyor..."
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmetcansertce@hotmail.com","password":"123456"}'
echo ""
echo "Yukarida access_token gorunduyse giris BASARILI!"
