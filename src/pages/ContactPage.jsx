import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const ContactPage = () => {
    const location = useLocation();
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: 'Genel Soru',
        message: ''
    });
    const [status, setStatus] = React.useState('idle'); // idle, submitting, success

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const subjectParam = params.get('subject');
        if (subjectParam) {
            setFormData(prev => ({ ...prev, subject: subjectParam }));
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: 'Genel Soru', message: '' });
            alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
            setStatus('idle');
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="İletişim"
                description="Haberfoni ile iletişime geçin. Soru, görüş ve önerileriniz için bize ulaşın."
                url="/iletisim"
            />
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">İletişim</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Görüşleriniz, önerileriniz ve sorularınız bizim için değerli. Aşağıdaki formu doldurarak veya iletişim kanallarımızdan bize ulaşabilirsiniz.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">İletişim Bilgileri</h3>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">E-posta</h4>
                                    <p className="text-gray-600">info@haberportalim.com</p>
                                    <p className="text-gray-600">reklam@haberportalim.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Telefon</h4>
                                    <p className="text-gray-600">+90 212 123 45 67</p>
                                    <p className="text-gray-600 text-sm text-gray-500">Hafta içi 09:00 - 18:00</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Adres</h4>
                                    <p className="text-gray-600">
                                        Maslak Mah. Büyükdere Cad.<br />
                                        No:123 Sarıyer<br />
                                        İstanbul, Türkiye
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    {/* Google Maps Embed */}
                    <div className="rounded-xl overflow-hidden h-64 w-full shadow-sm border border-gray-100">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633698339308!2d28.97798637668573!3d41.04799747134533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zVGFrc2ltIE1leWRhbsSxLCBHw7xtw7zFKnN1eXUsIDM0NDM3IEJleW_En2x1L8Swc3RhbmJ1bA!5e0!3m2!1str!2str!4v1709669647062!5m2!1str!2str"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps"
                        ></iframe>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">Bize Yazın</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                                    Adınız Soyadınız
                                </label>
                                <input
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    id="name"
                                    type="text"
                                    placeholder="Ad Soyad"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                    E-posta Adresiniz
                                </label>
                                <input
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    id="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subject">
                                Konu
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                                id="subject"
                                value={formData.subject}
                                onChange={handleChange}
                            >
                                <option>Genel Soru</option>
                                <option>Haber İhbarı</option>
                                <option>Reklam</option>
                                <option>Teknik Sorun</option>
                            </select>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
                                Mesajınız
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[150px]"
                                id="message"
                                placeholder="Mesajınızı buraya yazın..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button
                            className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={status === 'submitting'}
                        >
                            <span>{status === 'submitting' ? 'Gönderiliyor...' : 'Gönder'}</span>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
