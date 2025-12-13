import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Activity, Clock, User, FileText, Settings, Shield, AlertCircle, Trash2 } from 'lucide-react';

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const { data, count } = await adminService.getActivityLogs(page, LIMIT);
            setLogs(data || []);
            setTotal(count || 0);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'NEWS': return <FileText size={18} className="text-blue-500" />;
            case 'USER': return <User size={18} className="text-purple-500" />;
            case 'SETTINGS': return <Settings size={18} className="text-gray-500" />;
            case 'ADS': return <AlertCircle size={18} className="text-orange-500" />;
            default: return <Activity size={18} className="text-gray-400" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'CREATE': return 'Oluşturma';
            case 'UPDATE': return 'Güncelleme';
            case 'DELETE': return 'Silme';
            default: return action;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center mb-8">
                <Activity className="mr-3 text-primary" size={24} />
                <h1 className="text-2xl font-bold text-gray-800">İşlem Geçmişi</h1>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={async () => {
                        if (window.confirm('Tüm işlem geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve sadece son 1000 kayıt tutulacak şekilde otomatik temizleme zaten mevcuttur.')) {
                            try {
                                setLoading(true);
                                await adminService.clearActivityLogs();
                                loadLogs();
                            } catch (err) {
                                console.error('Clear logs error:', err);
                                alert('Temizleme sırasında hata oluştu.');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} />
                    <span>Geçmişi Temizle</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 w-16">Tür</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">İşlem</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Açıklama</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Kullanıcı</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 w-48">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                                            {getIcon(log.entity_type)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                                            {getActionLabel(log.action_type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {log.profiles?.full_name ? (
                                                <>
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-2">
                                                        {log.profiles.full_name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-600">{log.profiles.full_name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold mr-2">
                                                        ?
                                                    </div>
                                                    <span className="text-sm text-gray-500 font-mono">
                                                        {log.ip_address ? `IP: ${log.ip_address}` : 'Bilinmiyor'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(log.created_at).toLocaleString('tr-TR')}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        Henüz kaydedilmiş bir işlem bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Önceki
                    </button>
                    <span className="px-4 py-2 text-gray-600 self-center">
                        Sayfa {page}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * LIMIT >= total}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityLogsPage;
