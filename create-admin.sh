#!/bin/bash
echo "Admin kullanicisi olusturuluyor..."
docker exec -e MYSQL_PWD='Pr0duct10n_Root!2026' haberfoni_db \
  mysql -u root haberfoni \
  -e "INSERT IGNORE INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES ('ahmetcansertce@hotmail.com', '123456', 'Ahmet Admin', 'admin', 1, NOW(), NOW());"

echo "Kayit yapildi. Test ediliyor..."
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ahmetcansertce@hotmail.com","password":"123456"}'
echo ""
echo "access_token gorunduyse BASARILI!"
