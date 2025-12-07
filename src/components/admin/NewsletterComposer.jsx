import React, { useState } from 'react';
import { X, Send, Eye, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const NewsletterComposer = ({ isOpen, onClose, onSave, onSaveAndSend }) => {
    const [formData, setFormData] = useState({
        subject: '',
        content: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!formData.subject || !formData.content) {
            alert('Lütfen başlık ve içerik giriniz.');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
            setFormData({ subject: '', content: '' });
            onClose();
        } catch (error) {
            console.error('Save error:', error);
            alert('Kaydetme hatası: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndSend = async () => {
        if (!formData.subject || !formData.content) {
            alert('Lütfen başlık ve içerik giriniz.');
            return;
        }

        if (!onSaveAndSend) {
            alert('Mail gönderme özelliği mevcut değil.');
            return;
        }

        setSaving(true);
        try {
            await onSaveAndSend(formData);
            setFormData({ subject: '', content: '' });
            onClose();
        } catch (error) {
            console.error('Save and send error:', error);
            alert('Kaydetme ve gönderme hatası: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!formData.subject || !formData.content) {
            alert('Lütfen başlık ve içerik giriniz.');
            return;
        }

        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('HABERFONI BÜLTEN', 105, 20, { align: 'center' });

            // Subject
            doc.setFontSize(14);
            doc.text(formData.subject, 105, 35, { align: 'center' });

            // Date
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const date = new Date().toLocaleDateString('tr-TR');
            doc.text(date, 105, 45, { align: 'center' });

            // Line separator
            doc.line(20, 50, 190, 50);

            // Content
            doc.setFontSize(11);
            const splitContent = doc.splitTextToSize(formData.content, 170);
            doc.text(splitContent, 20, 60);

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Haberfoni © ${new Date().getFullYear()}`, 105, 285, { align: 'center' });
                doc.text(`Sayfa ${i} / ${pageCount}`, 190, 285, { align: 'right' });
            }

            // Download
            const fileName = `bulten-${formData.subject.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('PDF oluşturulurken hata oluştu.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Yeni Bülten Oluştur</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bülten Başlığı
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Örn: Haftalık Haber Bülteni - 6 Aralık 2024"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bülten İçeriği
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[400px] font-mono text-sm"
                                    placeholder="Bülten içeriğinizi buraya yazın...&#10;&#10;Örnek:&#10;Merhaba,&#10;&#10;Bu haftanın en önemli haberleri:&#10;&#10;1. Başlık 1&#10;   Özet metin...&#10;&#10;2. Başlık 2&#10;   Özet metin..."
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    💡 İpucu: Basit metin formatı kullanın. HTML desteklenmez.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Preview */
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{formData.subject}</h3>
                                <div className="text-gray-700 whitespace-pre-wrap">{formData.content}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Eye size={18} />
                            {showPreview ? 'Düzenle' : 'Önizle'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={!formData.subject || !formData.content}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="PDF olarak indir"
                        >
                            <Download size={18} />
                            PDF İndir
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Kaydediliyor...
                                </>
                            ) : (
                                'Kaydet'
                            )}
                        </button>
                        {onSaveAndSend && (
                            <button
                                onClick={handleSaveAndSend}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Kaydet ve Gönder
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterComposer;
