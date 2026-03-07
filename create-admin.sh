#!/bin/bash
echo "Admin kullanicisi olusturuluyor..."
docker exec haberfoni_db bash -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" haberfoni -e "INSERT IGNORE INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES ('"'"'ahmetcansertce@hotmail.com'"'"', '"'"'123456'"'"', '"'"'Ahmet Admin'"'"', '"'"'admin'"'"', 1, NOW(), NOW());"'

echo "Test ediliyor..."
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ahmetcansertce@hotmail.com","password":"123456"}'
echo ""
echo "access_token gorunduyse BASARILI!"
