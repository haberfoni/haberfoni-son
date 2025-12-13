import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, ArrowUp, ArrowDown, Layout, Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react';

const FooterLinksPage = () => {
    const [sections, setSections] = useState([]);
    const [linksBySection, setLinksBySection] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [showNewsletter, setShowNewsletter] = useState(true);

    const LOCKED_TITLES = ['Hakkımızda', 'İletişim', 'Künye', 'Reklam', 'Kariyer'];

    // Modals
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    // Editing States
    const [editingSection, setEditingSection] = useState(null);
    const [editingLink, setEditingLink] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null); // For adding link to specific section

    // Forms
    const [sectionForm, setSectionForm] = useState({ title: '', type: 'custom_links', is_active: true });
    const [linkForm, setLinkForm] = useState({ title: '', url: '', open_in_new_tab: false, is_active: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const sectionsData = await adminService.getFooterSections();
            setSections(sectionsData || []);

            // Initial expand all
            const expanded = {};
            sectionsData.forEach(s => expanded[s.id] = true);
            setExpandedSections(prev => ({ ...expanded, ...prev }));

            // Load settings
            const settings = await adminService.getSettings();
            setShowNewsletter(settings.footer_show_newsletter !== 'false');

            // Load links for custom_links sections
            const linksData = {};
            for (const section of sectionsData) {
                if (section.type === 'custom_links') {
                    const links = await adminService.getFooterLinks(section.id);
                    linksData[section.id] = links || [];
                }
            }
            setLinksBySection(linksData);

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Veriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // --- Section Handlers ---

    const handleCreateSection = () => {
        setEditingSection(null);
        setSectionForm({ title: '', type: 'custom_links', is_active: true });
        setIsSectionModalOpen(true);
    };

    const handleEditSection = (section) => {
        setEditingSection(section);
        setSectionForm({ title: section.title, type: section.type, is_active: section.is_active });
        setIsSectionModalOpen(true);
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm('Bu bölümü ve içindeki tüm linkleri silmek istediğinize emin misiniz?')) return;
        try {
            await adminService.deleteFooterSection(id);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Silinemedi.');
        }
    };

    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSection) {
                await adminService.updateFooterSection(editingSection.id, { title: sectionForm.title, is_active: sectionForm.is_active });
            } else {
                const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order_index || 0)) : 0;
                await adminService.createFooterSection({ ...sectionForm, order_index: maxOrder + 1 });
            }
            setIsSectionModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Kaydedilemedi.');
        }
    };

    const handleMoveSection = async (index, direction) => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        } else {
            return;
        }
        setSections(newSections);
        try {
            await adminService.reorderFooterSections(newSections.map((s, i) => ({ id: s.id, order_index: i })));
        } catch (error) {
            console.error(error);
            loadData(); // Revert
        }
    };

    const handleMoveLink = async (sectionId, index, direction) => {
        const sectionLinks = [...(linksBySection[sectionId] || [])];
        if (direction === 'up' && index > 0) {
            [sectionLinks[index], sectionLinks[index - 1]] = [sectionLinks[index - 1], sectionLinks[index]];
        } else if (direction === 'down' && index < sectionLinks.length - 1) {
            [sectionLinks[index], sectionLinks[index + 1]] = [sectionLinks[index + 1], sectionLinks[index]];
        } else {
            return;
        }

        // Optimistic UI Update
        setLinksBySection(prev => ({ ...prev, [sectionId]: sectionLinks }));

        try {
            await adminService.reorderFooterLinks(sectionLinks.map((l, i) => ({ id: l.id, order_index: i })));
        } catch (error) {
            console.error(error);
            loadData(); // Revert
        }
    };

    // --- Link Handlers ---

    const handleAddLink = (sectionId) => {
        setActiveSectionId(sectionId);
        setEditingLink(null);
        setLinkForm({ title: '', url: '', open_in_new_tab: false, is_active: true });
        setIsLinkModalOpen(true);
    };

    const handleEditLink = (link, sectionId) => {
        setActiveSectionId(sectionId);
        setEditingLink(link);
        setLinkForm({ title: link.title, url: link.url, open_in_new_tab: link.open_in_new_tab, is_active: link.is_active });
        setIsLinkModalOpen(true);
    };

    const handleDeleteLink = async (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await adminService.deleteFooterLink(id);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLink) {
                await adminService.updateFooterLink(editingLink.id, linkForm);
            } else {
                const currentLinks = linksBySection[activeSectionId] || [];
                const maxOrder = currentLinks.length > 0 ? Math.max(...currentLinks.map(l => l.order_index || 0)) : 0;
                await adminService.createFooterLink({
                    ...linkForm,
                    section_id: activeSectionId,
                    order_index: maxOrder + 1
                });
            }
            setIsLinkModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Link kaydedilemedi.');
        }
    };

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleToggleNewsletter = async () => {
        const newValue = !showNewsletter;
        setShowNewsletter(newValue);
        try {
            await adminService.updateSetting('footer_show_newsletter', newValue.toString());
        } catch (error) {
            console.error('Error updating setting:', error);
            setShowNewsletter(!newValue); // Revert on error
            alert('Ayarlar güncellenemedi.');
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Footer Yönetimi</h1>
                    <p className="text-gray-500 text-sm">Alt bilgi alanındaki bölümleri ve linkleri yönetin.</p>
                </div>
                <button
                    onClick={handleCreateSection}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-dark transition-colors"
                >
                    <Plus size={20} />
                    <span>Yeni Bölüm Ekle</span>
                </button>
            </div>

            {/* General Settings Card */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Genel Ayarlar</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-700">Bülten Aboneliği</h4>
                        <p className="text-sm text-gray-500">Footer alanında e-posta abonelik formunu göster.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showNewsletter}
                            onChange={handleToggleNewsletter}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                {sections.map((section, index) => (
                    <div key={section.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {expandedSections[section.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        {section.title}
                                        {section.type === 'dynamic_categories' && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                                                Otomatik Kategori
                                            </span>
                                        )}
                                        {!section.is_active && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-normal">
                                                Pasif
                                            </span>
                                        )}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex mr-4 bg-white rounded border border-gray-200">
                                    <button
                                        onClick={() => handleMoveSection(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 border-r border-gray-200"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveSection(index, 'down')}
                                        disabled={index === sections.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleEditSection(section)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                    title="Bölümü Düzenle"
                                >
                                    <Edit2 size={18} />
                                </button>
                                {section.type === 'custom_links' && (
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        title="Bölümü Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections[section.id] && (
                            <div className="p-6 border-t border-gray-100">
                                {section.type === 'dynamic_categories' ? (
                                    <div className="text-gray-500 italic flex items-center justify-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                                        <Layout size={20} className="mr-2" />
                                        Bu bölümde haber kategorileri otomatik olarak listelenir.
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={() => handleAddLink(section.id)}
                                                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md flex items-center transition-colors"
                                            >
                                                <Plus size={16} className="mr-1" /> Link Ekle
                                            </button>
                                        </div>

                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-white">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {linksBySection[section.id]?.map((link, lIndex) => {
                                                    const isLocked = LOCKED_TITLES.includes(link.title);
                                                    return (
                                                        <tr key={link.id} className={isLocked ? "bg-gray-100" : "hover:bg-gray-50"}>
                                                            <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="w-4 text-center mr-1">{lIndex + 1}</span>
                                                                    <div className="flex flex-col">
                                                                        <button
                                                                            onClick={() => handleMoveLink(section.id, lIndex, 'up')}
                                                                            disabled={lIndex === 0}
                                                                            className="text-gray-300 hover:text-gray-600 disabled:opacity-0"
                                                                        >
                                                                            <ChevronDown size={14} className="rotate-180" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleMoveLink(section.id, lIndex, 'down')}
                                                                            disabled={lIndex === (linksBySection[section.id]?.length || 0) - 1}
                                                                            className="text-gray-300 hover:text-gray-600 disabled:opacity-0"
                                                                        >
                                                                            <ChevronDown size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                                <span className={isLocked ? "text-gray-500" : ""}>{link.title}</span>
                                                                {isLocked && (
                                                                    <span title="Kilitli Sistem Linki" className="text-gray-400">
                                                                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500 truncate max-w-xs transition-opacity duration-200" style={{ opacity: isLocked ? 0.6 : 1 }}>
                                                                {link.url}
                                                            </td>
                                                            <td className="px-4 py-2 text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => handleEditLink(link, section.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                    title="Düzenle"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                {!isLocked && (
                                                                    <button
                                                                        onClick={() => handleDeleteLink(link.id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Sil"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {(!linksBySection[section.id] || linksBySection[section.id].length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                                                            Bu bölüme henüz link eklenmemiş.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Section Modal */}
            {isSectionModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingSection ? 'Bölümü Düzenle' : 'Yeni Bölüm Oluştur'}
                            </h3>
                            <button onClick={() => setIsSectionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSectionSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={sectionForm.title}
                                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                                />
                            </div>

                            {!editingSection && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm Tipi</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        value={sectionForm.type}
                                        onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value })}
                                    >
                                        <option value="custom_links">Özel Linkler (Elle Ekleme)</option>
                                        <option value="dynamic_categories">Otomatik Kategoriler</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        "Otomatik Kategoriler" seçilirse site kategorileri listelenir, link eklenemez.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="secActive"
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    checked={sectionForm.is_active}
                                    onChange={(e) => setSectionForm({ ...sectionForm, is_active: e.target.checked })}
                                />
                                <label htmlFor="secActive" className="text-sm text-gray-700 select-none">Aktif</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsSectionModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg flex items-center space-x-2">
                                    <Save size={18} /> <span>Kaydet</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingLink ? 'Linki Düzenle' : 'Yeni Link Ekle'}
                            </h3>
                            <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
                            {editingLink && LOCKED_TITLES.includes(editingLink.title) && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm mb-4">
                                    Bu sistem linkinin başlığı ve adresi değiştirilemez.
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    value={linkForm.title}
                                    onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                                    disabled={editingLink && LOCKED_TITLES.includes(editingLink.title)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="/hakkimizda veya https://google.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    value={linkForm.url}
                                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                                    disabled={editingLink && LOCKED_TITLES.includes(editingLink.title)}
                                />
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="linkNewTab"
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    checked={linkForm.open_in_new_tab}
                                    onChange={(e) => setLinkForm({ ...linkForm, open_in_new_tab: e.target.checked })}
                                />
                                <label htmlFor="linkNewTab" className="text-sm text-gray-700 select-none">Yeni sekmede aç</label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="linkActive"
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    checked={linkForm.is_active}
                                    onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
                                />
                                <label htmlFor="linkActive" className="text-sm text-gray-700 select-none">Aktif</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg flex items-center space-x-2">
                                    <Save size={18} /> <span>Kaydet</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterLinksPage;
