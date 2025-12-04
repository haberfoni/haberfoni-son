import React from 'react';
import SEO from '../components/SEO';

const KvkkPage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="KVKK Aydınlatma Metni"
                description="Haberfoni Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni."
                url="/kvkk"
            />
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">KVKK Aydınlatma Metni</h1>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                        Haberfoni olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz.
                        Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmekte ve korunmaktadır.
                    </p>

                    <h3>1. Veri Sorumlusu</h3>
                    <p>
                        6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, kişisel verileriniz; veri sorumlusu olarak
                        Haberfoni Medya A.Ş. tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                    </p>

                    <h3>2. Kişisel Verilerin İşlenme Amacı</h3>
                    <p>
                        Toplanan kişisel verileriniz; hukuka ve dürüstlük kurallarına uygun, doğru ve gerektiğinde güncel,
                        belirli, açık ve meşru amaçlar için, işlendikleri amaçla bağlantılı, sınırlı ve ölçülü olarak işlenmektedir.
                    </p>

                    <h3>3. Kişisel Verilerin Aktarılması</h3>
                    <p>
                        Kişisel verileriniz, Kanun'un 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları
                        çerçevesinde, iş ortaklarımıza, tedarikçilerimize, kanunen yetkili kamu kurumlarına ve özel kişilere aktarılabilecektir.
                    </p>

                    <h3>4. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h3>
                    <p>
                        Kişisel verileriniz, internet sitemiz, mobil uygulamalarımız, sosyal medya mecralarımız ve benzeri vasıtalarla
                        elektronik ortamda toplanmaktadır.
                    </p>

                    <h3>5. Veri Sahibinin Hakları</h3>
                    <p>
                        KVKK'nın 11. maddesi uyarınca veri sahipleri; kişisel veri işlenip işlenmediğini öğrenme,
                        kişisel verileri işlenmişse buna ilişkin bilgi talep etme, kişisel verilerin işlenme amacını ve
                        bunların amacına uygun kullanılıp kullanılmadığını öğrenme haklarına sahiptir.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KvkkPage;
