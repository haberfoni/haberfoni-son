import React from 'react';
import { Users, Eye, FileText, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

const DashboardPage = () => {
    // This data would typically come from an API
    const stats = [
        { label: 'Toplam Ziyaret', value: '1,254,302', change: '+12.5%', trend: 'up', icon: <Eye size={24} className="text-blue-500" /> },
        { label: 'Aktif Haberler', value: '843', change: '+4.2%', trend: 'up', icon: <FileText size={24} className="text-green-500" /> },
        { label: 'Yeni Aboneler', value: '1,430', change: '-2.1%', trend: 'down', icon: <Users size={24} className="text-purple-500" /> },
        { label: 'Gelir (Tahmini)', value: '₺42,500', change: '+8.4%', trend: 'up', icon: <TrendingUp size={24} className="text-yellow-500" /> },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Panele Hoşgeldiniz 👋</h1>
                <p className="text-gray-500">İşte bugünün raporları ve site durumu.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                }`}>
                                {stat.trend === 'up' ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Son Eklenen Haberler</h2>
                    <button className="text-sm text-primary hover:text-primary-dark font-medium">Tümünü Gör</button>
                </div>
                <div className="p-8 text-center text-gray-500">
                    Henüz veri akışı bağlanmadı.
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
