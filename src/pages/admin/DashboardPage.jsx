import React, { useEffect, useState } from 'react';
import { Users, Eye, FileText, MessageSquare, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalViews: 0,
        activeNews: 0,
        subscribers: 0,
        totalComments: 0
    });
    const [latestNews, setLatestNews] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch Stats
                const statsData = await adminService.getDashboardStats();
                setStats(statsData);

                // Fetch Latest News (Active Only, first 5)
                const { data: newsData } = await adminService.getNewsList(0, 5, { status: 'published' });
                setLatestNews(newsData || []);

            } catch (error) {
                console.error("Dashboard yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const statCards = [
        {
            label: 'Toplam Görüntülenme',
            value: (stats?.totalViews || 0).toLocaleString(),
            change: '-',
            trend: 'neutral',
            icon: <Eye size={24} className="text-blue-500" />
        },
        {
            label: 'Aktif Haberler',
            value: (stats?.activeNews || 0).toLocaleString(),
            change: 'Canlı',
            trend: 'up',
            icon: <FileText size={24} className="text-green-500" />
        },
        {
            label: 'Toplam Aboneler',
            value: (stats?.subscribers || 0).toLocaleString(),
            change: 'Hepsi',
            trend: 'up',
            icon: <Users size={24} className="text-purple-500" />
        },
        {
            label: 'Toplam Yorumlar',
            value: (stats?.totalComments || 0).toLocaleString(),
            change: 'İnteraktif',
            trend: 'up',
            icon: <MessageSquare size={24} className="text-yellow-500" />
        },
    ];

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Veriler yükleniyor...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Panele Hoşgeldiniz 👋</h1>
                <p className="text-gray-500">İşte güncel site durumu ve istatistikler.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {stat.icon}
                            </div>
                            {stat.change !== '-' && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center ${stat.trend === 'up' ? 'text-green-600 bg-green-50' :
                                    stat.trend === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                    }`}>
                                    {stat.trend === 'up' ? <ArrowUp size={12} className="mr-1" /> :
                                        stat.trend === 'down' ? <ArrowDown size={12} className="mr-1" /> : null}
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Son Eklenen Haberler</h2>
                    <Link to="/admin/news" className="text-sm text-primary hover:text-primary-dark font-medium">Tümünü Gör</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Başlık</th>
                                <th className="px-6 py-4 font-semibold">Kategori</th>
                                <th className="px-6 py-4 font-semibold">Görüntülenme</th>
                                <th className="px-6 py-4 font-semibold">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {latestNews.length > 0 ? (
                                latestNews.map((news) => (
                                    <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {news.image_url && (
                                                    <img
                                                        src={news.image_url}
                                                        alt=""
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">{news.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{news.summary}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {news.category || 'Genel'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {news.views?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <Calendar size={14} />
                                                <span>{formatDate(news.published_at || news.created_at)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Henüz haber eklenmemiş.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
