import React, { useState, useEffect } from 'react';
import { Mail, Check, Trash2, CheckCircle, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ContactMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unread'); // 'unread' or 'read'
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await adminService.getContactMessages();
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            setStatusMessage({ type: 'error', text: 'Mesajlar yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await adminService.markContactMessageAsRead(id);
            setMessages(messages.map(m =>
                m.id === id ? { ...m, is_read: true } : m
            ));
            setStatusMessage({ type: 'success', text: 'Mesaj okundu olarak işaretlendi.' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error marking as read:', error);
            setStatusMessage({ type: 'error', text: 'İşlem başarısız.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteContactMessage(id);
            setMessages(messages.filter(m => m.id !== id));
            setStatusMessage({ type: 'success', text: 'Mesaj silindi.' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting message:', error);
            setStatusMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    const filteredMessages = messages.filter(m => {
        if (activeTab === 'unread') return !m.is_read;
        if (activeTab === 'read') return m.is_read;
        return true;
    });

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Mail className="text-primary" />
                <span>Mesaj Kutusu ({messages.filter(m => !m.is_read).length} Okunmamış)</span>
            </h1>

            {statusMessage.text && (
                <div className={`p-4 rounded-lg mb-6 ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {statusMessage.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'unread' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Okunmamış
                    <span className="ml-2 bg-red-100 text-red-800 text-xs py-0.5 px-2 rounded-full">
                        {messages.filter(m => !m.is_read).length}
                    </span>
                </button>
                <button
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'read' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('read')}
                >
                    Okunanlar
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {activeTab === 'unread' ? 'Yeni mesajınız yok.' : 'Okunmuş mesajınız yok.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredMessages.map((msg) => (
                            <div key={msg.id} className={`p-6 transition-colors ${!msg.is_read ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-gray-900">{msg.name}</span>
                                            <span className="text-gray-400 text-xs">•</span>
                                            <span className="text-gray-600 text-sm">{msg.email}</span>
                                            <span className="text-gray-400 text-xs">•</span>
                                            <span className="text-gray-500 text-xs flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(msg.created_at).toLocaleString('tr-TR')}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-medium text-gray-800">
                                            {msg.subject || 'Konusuz'}
                                        </h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!msg.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(msg.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Okundu İşaretle"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactMessagesPage;
