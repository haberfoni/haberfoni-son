import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Check, Wand2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const TagSelector = ({ selectedTagIds = [], onChange }) => {
    const [allTags, setAllTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        loadTags();
    }, []);

    useEffect(() => {
        let filtered = allTags;

        // 1. Filter by Search
        if (search.trim()) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            // 2. Filter by Letter (only if no search)
            if (selectedLetter) {
                const letter = selectedLetter.toLocaleLowerCase('tr');
                filtered = filtered.filter(t =>
                    t.name.toLocaleLowerCase('tr').startsWith(letter)
                );
            }
        }

        // 3. Exclude already selected (Always)
        filtered = filtered.filter(t => !selectedTagIds.includes(t.id));

        setFilteredTags(filtered);
    }, [search, allTags, selectedTagIds, selectedLetter]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const loadTags = async () => {
        try {
            setLoading(true);
            const data = await adminService.getActiveTags(); // Changed from getTags to getActiveTags
            setAllTags(data || []);
        } catch (error) {
            console.error('Error loading tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (tagId) => {
        const newSelected = [...selectedTagIds, tagId];
        onChange(newSelected);
        setSearch(''); // Clear search on select to allow easy next selection
    };

    const handleRemove = (tagId) => {
        const newSelected = selectedTagIds.filter(id => id !== tagId);
        onChange(newSelected);
    };

    const handleCreateTag = async () => {
        if (!search.trim()) return;
        return await createAndSelectTag(search.trim());
    };

    const createAndSelectTag = async (tagName) => {
        try {
            setLoading(true);
            // Check if exists in allTags by name (case-insensitive)
            const existing = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            if (existing) {
                if (!selectedTagIds.includes(existing.id)) {
                    handleSelect(existing.id);
                }
                return;
            }

            const newTag = await adminService.addTag(tagName);
            setAllTags(prev => [...prev, newTag]);
            handleSelect(newTag.id);
            return newTag;
        } catch (error) {
            console.error('Error creating tag:', error);
            // Check if error is duplicate (Code 23505)
            if (error.code === '23505' || error.message.includes('unique')) {
                // Refresh tags to get the one causing conflict (likely conflict on Slug)
                const latestTags = await adminService.getTags();
                setAllTags(latestTags);

                // Try to find by Name first
                let found = latestTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());

                // If not found by name, try finding by generated slug
                if (!found) {
                    // Logic must match adminService's slug generation
                    // Using the same logic as adminService (which now uses our robust slugify)
                    const normalizedSearch = tagName.toLowerCase()
                        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ş/g, 's')
                        .replace(/ü/g, 'u').replace(/ı/g, 'i').replace(/ö/g, 'o')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .trim();

                    found = latestTags.find(t => t.slug === normalizedSearch);
                }

                if (found && !selectedTagIds.includes(found.id)) {
                    handleSelect(found.id);
                } else {
                    // Still fail if we can't find it (weird state)
                    console.warn('Tag creation failed with duplicate, but could not find existing tag.');
                }
            } else {
                alert('Etiket oluşturulurken hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTags = async () => {
        if (!search.trim()) return;
        const base = search.trim();

        // Templates
        const suggestions = [
            `${base} Haberleri`,
            `Son Dakika ${base}`,
            `${base} Gündemi`,
            `${base} Gelişmeleri`,
            `${base} Son Durum`
        ];

        setGenerating(true);
        try {
            // 1. Fetch latest tags to ensure we have up-to-date uniqueness check
            const latestTags = await adminService.getTags();
            let currentTagsList = [...latestTags];
            const tagsToSelect = [];

            // 2. Process all suggestions in parallel
            // We use a map to keep track of promises
            const processedTags = await Promise.all(suggestions.map(async (tagName) => {
                const existing = currentTagsList.find(t => t.name.toLowerCase() === tagName.toLowerCase());

                if (existing) {
                    return existing;
                } else {
                    try {
                        // Create if not exists
                        return await adminService.addTag(tagName);
                    } catch (err) {
                        // Handle potential race condition if tag was created milliseconds ago
                        if (err.code === '23505' || err.message.includes('unique')) {
                            // Retry fetch
                            const fresh = await adminService.getTags();
                            return fresh.find(t => t.name.toLowerCase() === tagName.toLowerCase());
                        }
                        return null;
                    }
                }
            }));

            // 3. Collect valid tags
            const validTags = processedTags.filter(t => t !== null);

            // 4. Update local state BATCHED
            // Merge new tags into allTags (deduplicating by ID)
            const uniqueAllTags = [...latestTags];
            validTags.forEach(vt => {
                if (!uniqueAllTags.find(t => t.id === vt.id)) {
                    uniqueAllTags.push(vt);
                }
            });

            setAllTags(uniqueAllTags);

            // 5. Update selection BATCHED
            // Combine current selection with new generated tags
            const newSelectionIds = new Set(selectedTagIds);
            validTags.forEach(t => newSelectionIds.add(t.id));
            onChange(Array.from(newSelectionIds));

            setSearch('');
        } catch (error) {
            console.error('Generation error:', error);
        } finally {
            setGenerating(false);
            setIsOpen(true);
        }
    };

    // Derived list of selected tag objects
    const selectedTags = allTags.filter(t => selectedTagIds.includes(t.id));

    // Turkish additions for A-Z
    const turkishAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

    return (
        <div className="w-full" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler</label>

            {/* Selected Tags Display */}
            <div className={`min-h-[42px] p-2 border border-gray-300 rounded-lg bg-white flex flex-col gap-2 ${isOpen ? 'ring-2 ring-primary border-primary' : ''}`}
                onClick={() => setIsOpen(true)}>

                <div className="flex flex-wrap gap-2">
                    {selectedTags.length === 0 && !search && (
                        <span className="text-gray-400 text-sm py-1 px-1">Etiket seçmek için tıklayın...</span>
                    )}

                    {selectedTags.map(tag => (
                        <span key={tag.id} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-md">
                            {tag.name}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(tag.id);
                                }}
                                className="ml-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 p-0.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>

                {/* Search Input Area */}
                <div className="flex items-center space-x-2 border-t pt-2 mt-1 border-gray-100">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                            if (e.target.value) setSelectedLetter(null); // Clear letter filter on search
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="flex-1 min-w-[100px] outline-none text-sm bg-transparent py-1"
                        placeholder="Etiket ara veya oluştur..."
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateTags();
                            }}
                            disabled={generating}
                            className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-xs font-medium"
                            title="İlgili etiketleri otomatik türet"
                        >
                            <Wand2 size={12} />
                            <span>{generating ? 'Türetiliyor...' : 'Türet'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="relative">
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-hidden sm:text-sm">

                        {/* A-Z Filter Bar */}
                        {!search && (
                            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedLetter(null); }}
                                    className={`text-xs px-1.5 py-0.5 rounded ${!selectedLetter ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Tümü
                                </button>
                                {turkishAlphabet.map(char => (
                                    <button
                                        key={char}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedLetter(char); }}
                                        className={`text-xs px-1.5 py-0.5 rounded ${selectedLetter === char ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="max-h-60 overflow-auto">
                            {loading && <div className="p-2 text-center text-gray-500">Yükleniyor...</div>}

                            {!loading && filteredTags.length > 0 && (
                                filteredTags.map(tag => (
                                    <div
                                        key={tag.id}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                                        onClick={() => handleSelect(tag.id)}
                                    >
                                        <span className="block truncate">{tag.name}</span>
                                    </div>
                                ))
                            )}

                            {/* ALWAYS show create option if search is present, to allow creating/selecting exact match if not in active list */}
                            {!loading && search && (
                                <div
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 border-t border-gray-100 hover:bg-blue-50 text-blue-700 bg-gray-50"
                                    onClick={handleCreateTag}
                                >
                                    <div className="flex items-center">
                                        <Plus size={16} className="mr-2" />
                                        <span>
                                            {filteredTags.some(t => t.name.toLowerCase() === search.toLowerCase())
                                                ? <i>Mevcut etiketi seç: </i>
                                                : <i>Oluştur/Seç: </i>}
                                            "<b>{search}</b>"
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!loading && filteredTags.length === 0 && !search && (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    {selectedLetter ? `"${selectedLetter}" ile başlayan etiket bulunamadı.` : 'Gösterilecek etiket yok.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagSelector;
