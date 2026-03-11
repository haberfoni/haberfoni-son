#!/bin/bash
docker exec haberfoni_db bash -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" haberfoni -e "INSERT IGNORE INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES ('"'"'ahmetcansertce@hotmail.com'"'"', '"'"'123456'"'"', '"'"'Ahmet Admin'"'"', '"'"'admin'"'"', 1, NOW(), NOW());"'
echo "------------------------------------------"
echo "Admin kullanicisi basariyla olusturuldu!"
echo "E-posta: ahmetcansertce@hotmail.com"
echo "Sifre: 123456"
echo "------------------------------------------"
