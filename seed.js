import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive list of news items for all categories
const newsData = [
    // Medya
    {
        category: "Medya",
        title: "Ünlü Sunucu Ekranlara Geri Dönüyor",
        summary: "Uzun süredir ekranlardan uzak kalan sevilen sunucu, yeni projesiyle izleyici karşısına çıkmaya hazırlanıyor.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
        author: "Medya Servisi",
        views: 1200,
        is_slider: false
    },
    {
        category: "Medya",
        title: "Reyting Sonuçları Açıklandı: Zirve El Değiştirdi",
        summary: "Dün akşamın reyting sonuçlarına göre, iddialı dizi zirveye yerleşti. İşte detaylar...",
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80",
        author: "Analiz Ekibi",
        views: 2300,
        is_slider: false
    },

    // Gündem
    {
        category: "Gündem",
        title: "İstanbul'da Beklenen Yoğun Kar Yağışı Başladı",
        summary: "Meteoroloji'nin uyarılarının ardından İstanbul'un yüksek kesimlerinde kar yağışı etkisini göstermeye başladı.",
        image: "https://images.unsplash.com/photo-1485594050903-8e8ee5322318?w=1600&q=80",
        author: "Haber Merkezi",
        views: 8900,
        is_slider: true,
        slider_order: 1
    },
    {
        category: "Gündem",
        title: "Eğitimde Yeni Düzenleme: Müfredat Değişiyor",
        summary: "Milli Eğitim Bakanlığı, yeni eğitim öğretim yılında uygulanacak müfredat değişikliklerini duyurdu.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
        author: "Eğitim Servisi",
        views: 5600,
        is_slider: false
    },

    // Politika
    {
        category: "Politika",
        title: "Meclis'te Yoğun Mesai: Yeni Yasa Teklifi Görüşülüyor",
        summary: "TBMM Genel Kurulu'nda, kamuoyunun yakından takip ettiği yeni yasa teklifi üzerindeki görüşmeler devam ediyor.",
        image: "https://images.unsplash.com/photo-1529101091760-61df6be5d18b?w=1600&q=80",
        author: "Ankara Temsilcisi",
        views: 4500,
        is_slider: true,
        slider_order: 2
    },
    {
        category: "Politika",
        title: "Parti Liderlerinden Önemli Açıklamalar",
        summary: "Siyasi parti liderleri, haftalık grup toplantılarında gündeme dair önemli değerlendirmelerde bulundu.",
        image: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80",
        author: "Politika Masası",
        views: 3200,
        is_slider: false
    },

    // Magazin
    {
        category: "Magazin",
        title: "Yılın Düğünü İçin Geri Sayım Başladı",
        summary: "Ünlü çiftin düğün tarihi belli oldu. Hazırlıklar tüm hızıyla devam ediyor.",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
        author: "Magazin Muhabiri",
        views: 6700,
        is_slider: false
    },
    {
        category: "Magazin",
        title: "Ünlü Şarkıcıdan Samimi İtiraflar",
        summary: "Sevilen popçu, verdiği röportajda kariyeri ve özel hayatıyla ilgili bilinmeyenleri anlattı.",
        image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80",
        author: "Magazin Servisi",
        views: 4100,
        is_slider: false
    },

    // Ekonomi
    {
        category: "Ekonomi",
        title: "Merkez Bankası Faiz Kararını Açıkladı",
        summary: "Piyasaların merakla beklediği faiz kararı açıklandı. Dolar ve Altın fiyatlarında hareketlilik.",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=1600&q=80",
        author: "Ekonomi Editörü",
        views: 10500,
        is_slider: true,
        slider_order: 3
    },
    {
        category: "Ekonomi",
        title: "Borsada Rekor Kapanış",
        summary: "BIST 100 endeksi günü rekor seviyeden tamamladı. Yatırımcıların yüzü gülüyor.",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        author: "Finans Uzmanı",
        views: 8200,
        is_slider: false
    },

    // Spor
    {
        category: "Spor",
        title: "Süper Lig'de Dev Derbi Heyecanı",
        summary: "Hafta sonu oynanacak dev derbi öncesi nefesler tutuldu. Muhtemel 11'ler belli oldu.",
        image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1600&q=80",
        author: "Spor Servisi",
        views: 15000,
        is_slider: true,
        slider_order: 4
    },
    {
        category: "Spor",
        title: "Milli Voleybolcularımızdan Tarihi Başarı",
        summary: "Filenin Sultanları, Avrupa Şampiyonası'nda final biletini kaptı.",
        image: "https://images.unsplash.com/photo-1612872087720-48ca556fa396?w=800&q=80",
        author: "Spor Editörü",
        views: 12500,
        is_slider: false
    },

    // Dünya
    {
        category: "Dünya",
        title: "İklim Zirvesi'nde Kritik Kararlar",
        summary: "Dünya liderleri, küresel ısınma ile mücadele için yeni eylem planı üzerinde anlaştı.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
        author: "Dış Haberler",
        views: 3400,
        is_slider: true,
        slider_order: 5
    },
    {
        category: "Dünya",
        title: "Avrupa'da Enerji Krizi Endişesi",
        summary: "Kış ayları yaklaşırken Avrupa ülkeleri enerji tasarrufu önlemlerini artırıyor.",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
        author: "Dış Haberler",
        views: 2900,
        is_slider: false
    },

    // Teknoloji
    {
        category: "Teknoloji",
        title: "Yapay Zeka Devrimi: Yeni Dil Modeli Tanıtıldı",
        summary: "Teknoloji devi, insan gibi düşünebilen yeni yapay zeka modelini duyurdu.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&q=80",
        author: "Teknoloji Editörü",
        views: 9800,
        is_slider: true,
        slider_order: 6
    },
    {
        category: "Teknoloji",
        title: "Yerli Otomobil TOGG Yollara Çıkıyor",
        summary: "Türkiye'nin yerli otomobili TOGG'un ilk teslimatları başladı.",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
        author: "Oto-Tekno",
        views: 7500,
        is_slider: false
    },

    // Sağlık
    {
        category: "Sağlık",
        title: "Kış Hastalıklarına Karşı Doğal Kalkan",
        summary: "Uzmanlar, bağışıklık sistemini güçlendiren 5 mucizevi besini açıkladı.",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
        author: "Sağlık Köşesi",
        views: 4500,
        is_slider: false
    },
    {
        category: "Sağlık",
        title: "Düzenli Uykunun Önemi: Beyin Sağlığını Koruyor",
        summary: "Yeni yapılan araştırma, düzenli uykunun hafıza ve konsantrasyon üzerindeki etkisini kanıtladı.",
        image: "https://images.unsplash.com/photo-1541781777-c186d1e922f3?w=800&q=80",
        author: "Dr. Sağlık",
        views: 3100,
        is_slider: false
    },

    // Kültür Sanat
    {
        category: "Kültür Sanat",
        title: "İstanbul Film Festivali Başlıyor",
        summary: "Sinemaseverlerin heyecanla beklediği festival, zengin programıyla kapılarını açıyor.",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80",
        author: "Kültür Servisi",
        views: 2200,
        is_slider: true,
        slider_order: 7
    },
    {
        category: "Kültür Sanat",
        title: "Ünlü Yazarın Yeni Kitabı Rekor Kırdı",
        summary: "Nobel ödüllü yazarın son romanı, ilk haftasında satış rekorları kırdı.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
        author: "Kitap Kurdu",
        views: 1800,
        is_slider: false
    },

    // Otomobil
    {
        category: "Otomobil",
        title: "2025 Model Elektrikli Araçlar Tanıtıldı",
        summary: "Otomotiv devleri, yeni nesil elektrikli araç modellerini fuarda sergiledi.",
        image: "https://images.unsplash.com/photo-1593055497430-827825dd3d70?w=800&q=80",
        author: "Oto Haber",
        views: 5200,
        is_slider: false
    },

    // Emlak
    {
        category: "Emlak",
        title: "Konut Satışlarında Son Durum",
        summary: "TÜİK verilerine göre konut satışları geçen aya göre artış gösterdi.",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
        author: "Emlak Uzmanı",
        views: 3600,
        is_slider: false
    }
];

async function seed() {
    console.log('Starting seed...');

    // 1. Fetch Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) {
        console.error('Error fetching categories:', catError);
        return;
    }

    // Create a map of "Category Name" -> "ID"
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c.id);

    // Fallback if map is empty (though it shouldn't be if schema script ran)
    if (Object.keys(categoryMap).length === 0) {
        console.error("No categories found in DB. Please run the schema script first.");
        return;
    }

    // 2. Clear existing news (Optional, to avoid duplicates if run multiple times)
    // await supabase.from('news').delete().neq('id', 0); // Be proper with RLS/Errors

    // 3. Insert News Items
    console.log('Inserting news items...');
    for (const item of newsData) {
        let categoryId = categoryMap[item.category];

        // Handle strict mapping or fallback
        if (!categoryId) {
            console.warn(`Category '${item.category}' not found in DB. Using first available category.`);
            categoryId = categories[0].id;
        }

        const { error } = await supabase.from('news').insert({
            title: item.title,
            summary: item.summary,
            content: `<p>${item.summary}</p><p>Haberin detayları burada yer alacak...</p>`,
            image_url: item.image,
            category_id: categoryId,
            author: item.author,
            views: item.views,
            is_slider: item.is_slider,
            slider_order: item.slider_order || null,
            published_at: new Date().toISOString()
        });

        if (error) {
            console.error(`Error inserting news: ${item.title}`, error);
        } else {
            console.log(`Inserted: ${item.title}`);
        }
    }

    console.log('Seed completed!');
}

seed();
