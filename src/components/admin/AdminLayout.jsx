import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Image,
    Video,
    Settings,
    LogOut,
    Menu,
    X,
    Megaphone,
    BarChart,
    Repeat,
    Shield,
    MessageSquare,
    Tag,
    Mail,
    Users
} from 'lucide-react';

const AdminLayout = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Panel', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/news', label: 'Haberler', icon: <FileText size={20} /> },
        { path: '/admin/photo-galleries', label: 'Foto Galeri', icon: <Image size={20} /> },
        { path: '/admin/video-galleries', label: 'Video Galeri', icon: <Video size={20} /> },
        { path: '/admin/comments', label: 'Yorum Yönetimi', icon: <MessageSquare size={20} /> },
        { path: '/admin/ads', label: 'Reklam Yönetimi', icon: <Megaphone size={20} /> },
        { path: '/admin/subscribers', label: 'Abone Yönetimi', icon: <Mail size={20} /> },
        { path: '/admin/users', label: 'Kullanıcılar', icon: <Users size={20} /> },
        { path: '/admin/tags', label: 'Etiketler', icon: <Tag size={20} /> },
        { path: '/admin/redirects', label: 'Yönlendirmeler', icon: <Repeat size={20} /> },
        { path: '/admin/seo', label: 'SEO Dosyaları', icon: <Shield size={20} /> },
        { path: '/admin/settings', label: 'Ayarlar & API', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <span className="text-xl font-bold text-gray-800">Haberfoni Admin</span>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500">Yönetici</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-white shadow-sm flex items-center px-4 lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700 p-2"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 text-lg font-bold text-gray-900">Yönetim Paneli</span>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
