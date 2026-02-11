import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { fetchCategories } from '../../services/api';

const HomeLayoutPage = () => {
    const [sections, setSections] = useState([
        { id: 'home_top', name: 'Üst Reklam', type: 'ad', enabled: true, removable: false },
        { id: 'headline_slider', name: 'Manşet 1 (Ana Manşet)', type: 'content', enabled: true, removable: false },
        { id: 'surmanset', name: 'Manşet 2 (Sürmanşet)', type: 'content', enabled: true, removable: true },
        { id: 'home_list_top', name: 'Ana Sayfa Liste Üstü', type: 'ad', enabled: true, removable: true },
        { id: 'breaking_news', name: 'Son Dakika', type: 'content', enabled: true, removable: false },
        { id: 'multimedia', name: 'Multimedya (Video & Foto)', type: 'content', enabled: true, removable: true },
        { id: 'categories', name: 'Kategori Bölümleri (Dinamik)', type: 'content', enabled: true, removable: true }
    ]);
    const [categoryConfig, setCategoryConfig] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadLayout();
    }, []);

    const loadLayout = async () => {
        try {
            const [layout, categories] = await Promise.all([
                adminService.getHomeLayout(),
                fetchCategories()
            ]);

            if (layout && layout.sections) {
                setSections(layout.sections);
            }

            // Initialize or load category config
            if (layout && layout.categoryConfig && layout.categoryConfig.length > 0) {
                // Remove deleted categories and add new ones if any (sync with current categories)
                const currentSlugs = categories.map(c => c.slug);
                const validConfig = layout.categoryConfig.filter(c => currentSlugs.includes(c.id));

                // Add new categories that are not in config yet
                const newCategories = categories
                    .filter(c => !validConfig.find(vc => vc.id === c.slug))
                    .map(c => ({ id: c.slug, title: c.name, enabled: true }));

                setCategoryConfig([...validConfig, ...newCategories]);
            } else {
                // Initial config from all categories
                setCategoryConfig(categories.map(c => ({
                    id: c.slug,
                    title: c.name,
                    enabled: true
                })));
            }

        } catch (error) {
            console.error('Error loading layout:', error);
        }
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
    };

    const moveDown = (index) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
    };

    const toggleSection = (id) => {
        setSections(sections.map(section =>
            section.id === id ? { ...section, enabled: !section.enabled } : section
        ));
    };

    // Category Management Functions
    const moveCategoryUp = (index) => {
        if (index === 0) return;
        const newConfig = [...categoryConfig];
        [newConfig[index - 1], newConfig[index]] = [newConfig[index], newConfig[index - 1]];
        setCategoryConfig(newConfig);
    };

    const moveCategoryDown = (index) => {
        if (index === categoryConfig.length - 1) return;
        const newConfig = [...categoryConfig];
        [newConfig[index], newConfig[index + 1]] = [newConfig[index + 1], newConfig[index]];
        setCategoryConfig(newConfig);
    };

    const toggleCategory = (id) => {
        setCategoryConfig(categoryConfig.map(cat =>
            cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
        ));
    };

    const updateCategoryTitle = (id, newTitle) => {
        setCategoryConfig(categoryConfig.map(cat =>
            cat.id === id ? { ...cat, title: newTitle } : cat
        ));
    };

    const saveLayout = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await adminService.saveHomeLayout({ sections, categoryConfig });
            setMessage({ type: 'success', text: 'Ana sayfa düzeni ve kategori ayarları kaydedildi!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving layout:', error);
            setMessage({ type: 'error', text: 'Kaydetme hatası!' });
        } finally {
            setSaving(false);
        }
    };

    const resetLayout = async () => {
        if (window.confirm('Ana sayfa düzenini ve kategori ayarlarını varsayılana döndürmek istediğinize emin misiniz?')) {
            const defaultLayout = [
                { id: 'home_top', name: 'Üst Reklam', type: 'ad', enabled: true, removable: false },
                { id: 'headline_slider', name: 'Manşet 1 (Ana Manşet)', type: 'content', enabled: true, removable: false },
                { id: 'surmanset', name: 'Manşet 2 (Sürmanşet)', type: 'content', enabled: true, removable: true },
                { id: 'breaking_news', name: 'Son Dakika', type: 'content', enabled: true, removable: false },
                { id: 'multimedia', name: 'Multimedya (Video & Foto)', type: 'content', enabled: true, removable: true },
                { id: 'categories', name: 'Kategori Bölümleri (Dinamik)', type: 'content', enabled: true, removable: true }
            ];

            setSections(defaultLayout);

            // Reload categories to reset config
            try {
                const categories = await fetchCategories();
                const defaultConfig = categories.map(c => ({
                    id: c.slug,
                    title: c.name,
                    enabled: true
                }));
                setCategoryConfig(defaultConfig);

                await adminService.saveHomeLayout({ sections: defaultLayout, categoryConfig: defaultConfig });
                setMessage({ type: 'success', text: 'Düzen varsayılana sıfırlandı ve kaydedildi!' });
            } catch (error) {
                console.error('Error resetting:', error);
                setMessage({ type: 'error', text: 'Sıfırlama hatası!' });
            }
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ana Sayfa Düzeni</h1>
                <p className="text-gray-600">
                    Ana sayfa bölümlerini ve görünecek kategorileri buradan yönetebilirsiniz.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 mb-6">
                <button
                    onClick={resetLayout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <RotateCcw size={18} />
                    Sıfırla
                </button>
                <button
                    onClick={saveLayout}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section Ordering */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Bölüm Sıralaması</h2>
                    <div className="space-y-3">
                        {sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                                    ${section.enabled
                                        ? 'bg-white border-gray-100 hover:border-blue-100'
                                        : 'bg-gray-50 border-gray-100 opacity-60'}
                                `}
                            >
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><ChevronUp size={18} /></button>
                                    <button onClick={() => moveDown(index)} disabled={index === sections.length - 1} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><ChevronDown size={18} /></button>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${section.type === 'ad' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {section.type === 'ad' ? 'Reklam' : 'İçerik'}
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm">{section.name}</span>
                                    </div>
                                </div>

                                <button onClick={() => toggleSection(section.id)} className={`p-1.5 rounded-lg ${section.enabled ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                    {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Kategori Yönetimi</h2>
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mb-4">
                        ⚠️ Dikkat: Bir kategorinin ana sayfada görünebilmesi için <strong>en az 4 haberi</strong> olması gerekmektedir. Yeterli haberi olmayan kategoriler burada aktif olsa bile ana sayfada görünmez.
                    </p>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {categoryConfig.map((cat, index) => (
                            <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 ${cat.enabled ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveCategoryUp(index)} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><ChevronUp size={16} /></button>
                                    <button onClick={() => moveCategoryDown(index)} disabled={index === categoryConfig.length - 1} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><ChevronDown size={16} /></button>
                                </div>

                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">Kategori: {cat.id}</div>
                                    <input
                                        type="text"
                                        value={cat.title}
                                        onChange={(e) => updateCategoryTitle(cat.id, e.target.value)}
                                        className="w-full text-sm font-medium border-b border-dashed border-gray-300 focus:border-blue-500 outline-none bg-transparent py-1"
                                        placeholder="Görünen Başlık"
                                    />
                                </div>

                                <button onClick={() => toggleCategory(cat.id)} className={`p-1.5 rounded-lg ${cat.enabled ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                    {cat.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        ))}
                        {categoryConfig.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">Hiç kategori bulunamadı.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Bilgi</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Bölüm Sıralaması:</strong> Ana sayfadaki büyük blokların yerini değiştirir.</li>
                    <li>• <strong>Kategori Yönetimi:</strong> "Kategori Bölümleri" bloğu içindeki kategorilerin sırasını ve başlıklarını belirler.</li>
                    <li>• Kategorilerin başlıklarına tıklayıp (örneğin "Gündem" yerine "Günün Özeti") değiştirebilirsiniz.</li>
                </ul>
            </div>
        </div>
    );
};


export default HomeLayoutPage;
