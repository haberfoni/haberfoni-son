import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { adminService } from '../../services/adminService';
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
    BookOpen,
    Users,
    Layers,
    RefreshCw
} from 'lucide-react';

const AdminLayout = () => {
    const { signOut, user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useSiteSettings();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [counts, setCounts] = React.useState({ messages: 0, comments: 0 });

    React.useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await adminService.getUnreadCounts();
                if (data) {
                    setCounts(data);
                }
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();

        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const allMenuItems = [
        { path: '/admin/dashboard', label: 'Panel', icon: <LayoutDashboard size={20} />, roles: ['admin', 'editor', 'author'] },
        { path: '/admin/news', label: 'Haberler', icon: <FileText size={20} />, roles: ['admin', 'editor', 'author'] },
        { path: '/admin/categories', label: 'Kategoriler', icon: <Layers size={20} />, roles: ['admin', 'editor'] },
        { path: '/admin/pages', label: 'Sayfalar', icon: <FileText size={20} />, roles: ['admin', 'editor'] },
        { path: '/admin/headlines', label: 'Manşet Yönetimi', icon: <Megaphone size={20} />, roles: ['admin', 'editor'] },
        { path: '/admin/photo-galleries', label: 'Foto Galeri', icon: <Image size={20} />, roles: ['admin', 'editor'] },
        { path: '/admin/video-galleries', label: 'Video Galeri', icon: <Video size={20} />, roles: ['admin', 'editor'] },
        {
            path: '/admin/contact-messages',
            label: 'Mesaj Kutusu',
            icon: <Mail size={20} />,
            badge: counts.messages > 0 ? counts.messages : null,
            roles: ['admin', 'editor']
        },
        {
            path: '/admin/comments',
            label: 'Yorum Yönetimi',
            icon: <MessageSquare size={20} />,
            badge: counts.comments > 0 ? counts.comments : null,
            roles: ['admin', 'editor']
        },
        { path: '/admin/ads', label: 'Reklam Yönetimi', icon: <Megaphone size={20} />, roles: ['admin'] },
        { path: '/admin/home-layout', label: 'Ana Sayfa Düzeni', icon: <Layers size={20} />, roles: ['admin'] },
        { path: '/admin/subscribers', label: 'Abone Yönetimi', icon: <Mail size={20} />, roles: ['admin'] },
        { path: '/admin/users', label: 'Kullanıcılar', icon: <Users size={20} />, roles: ['admin'] },
        { path: '/admin/footer-links', label: 'Footer Yönetimi', icon: <Layers size={20} />, roles: ['admin'] },
        { path: '/admin/tags', label: 'Etiketler', icon: <Tag size={20} />, roles: ['admin'] },
        { path: '/admin/redirects', label: 'Yönlendirmeler', icon: <Repeat size={20} />, roles: ['admin'] },
        { path: '/admin/seo', label: 'SEO Dosyaları', icon: <Shield size={20} />, roles: ['admin'] },
        { path: '/admin/email-settings', label: 'Email Ayarları', icon: <Mail size={20} />, roles: ['admin'] },
        { path: '/admin/activity-logs', label: 'İşlem Geçmişi', icon: <BarChart size={20} />, roles: ['admin'] },
        { path: '/admin/settings', label: 'Ayarlar & API', icon: <Settings size={20} />, roles: ['admin'] },
        { path: '/admin/bot-settings', label: 'Bot Ayarları', icon: <RefreshCw size={20} />, roles: ['admin'] },
        {
            path: '/admin/setup-guide',
            label: 'Kurulum Rehberi',
            icon: <BookOpen size={20} />,
            badge: 'Yeni',
            roles: ['admin']
        },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(profile?.role || 'author')
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <title>Panel | Haberfoni Admin</title>
                {settings?.favicon && <link rel="icon" href={settings.favicon} />}
            </Helmet>

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
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {profile?.full_name || user?.email}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                            {profile?.role === 'admin' ? 'Yönetici' :
                                profile?.role === 'editor' ? 'Editör' :
                                    profile?.role === 'author' ? 'Yazar' :
                                        'Kullanıcı'}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center px-3 py-2.5 rounded-lg transition-colors relative group
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                        }
                                    `}
                                >
                                    <span className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}>
                                        {item.icon}
                                    </span>
                                    <span className="ml-3 font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${typeof item.badge === 'string'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} className="mr-3" />
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden flex items-center justify-between px-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="text-lg font-bold text-gray-800">Haberfoni</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
