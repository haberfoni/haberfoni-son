# Haberfoni - Kurulum Kılavuzu

Bu kılavuz, projenizin Docker üzerinde sorunsuz çalışması için yapmanız gereken adımları içerir. Dosyaları yeniden yüklediğiniz için veritabanını sıfırdan kurmanız gerekebilir.

## 1. Sisteme Hazırlık
Öncelikle sisteminizde **Docker Desktop**'ın kurulu ve çalışıyor olduğundan emin olun.

## 2. Sistemi Ayağa Kaldırma
Terminalde (PowerShell veya CMD) proje ana dizinindeyken aşağıdaki komutu çalıştırın:

```bash
docker-compose up -d --build
```
Bu komut veritabanı, backend, bot ve frontend servislerini oluşturup arka planda çalıştıracaktır.

## 3. Veritabanı Yapılandırması (Prisma)
Konteynerler çalıştıktan sonra, veritabanı tablolarını oluşturmak için şu komutu çalıştırın:

```bash
docker exec -it haberfoni_backend npx prisma db push
```

## 4. Başlangıç Verilerini Ekleme (Seed)
Siteye örnek haberler ve kategoriler eklemek için şu komutu çalıştırın:

```bash
docker exec -it haberfoni_backend npm run seed
```
*(Not: Backend içindeki `prisma/seed.ts` dosyası kullanılacaktır.)*

## 5. Uygulama Adresleri
Her şey yolunda gittiğinde şuralardan erişebilirsiniz:

- **Web Sitesi (Frontend):** [http://localhost](http://localhost)
- **API (Backend):** [http://localhost:3000](http://localhost:3000)
- **Veritabanı Yönetimi (phpMyAdmin):** [http://localhost:8080](http://localhost:8080)
  - Sunucu: `db`
  - Kullanıcı: `root`
  - Şifre: `.env` dosyanızdaki `MYSQL_ROOT_PASSWORD` (Varsayılan: `rootpassword`)

## Önemli Notlar
- Sitenin bozulmaması için mevcut kodlarda değişiklik yapılmamıştır, sadece yapılandırma eksikleri giderilmiştir.
- Bot servisi her 15 dakikada bir otomatik olarak haber çekecek şekilde ayarlanmıştır.
