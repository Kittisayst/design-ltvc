import React, { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, Search, Plus, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import './PanelCommon.css';
import './TemplatesPanel.css';

export function TemplatesPanel({ canvasManager }) {
    const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
    const [templates, setTemplates] = useState([]); // Presets
    const [customTemplates, setCustomTemplates] = useState([]); // My Templates
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const categoryScrollRef = useRef(null);

    const handleCategoryScroll = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = 150;
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Load Presets
    useEffect(() => {
        fetch('data/templates.json')
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(err => console.error('Error loading templates:', err));

        loadCustomTemplates();
    }, []);

    const loadCustomTemplates = () => {
        try {
            const stored = localStorage.getItem('canvas_pro_my_templates');
            if (stored) {
                setCustomTemplates(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load custom templates", e);
        }
    };

    const categories = ['All', ...new Set(templates.map(t => t.category).filter(Boolean))];

    // Filter Logic
    const getFilteredTemplates = () => {
        const source = activeTab === 'presets' ? templates : customTemplates;

        return source.filter(t => {
            const matchesCategory = activeTab === 'custom' || filterCategory === 'All' || t.category === filterCategory;
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    };

    const filteredTemplates = getFilteredTemplates();

    const handleLoadTemplate = async (template) => {
        if (!canvasManager) return;

        if (confirm('Load template? Unsaved changes will be replaced.')) {
            try {
                if (activeTab === 'presets' && template.file) {
                    const res = await fetch(template.file);
                    const json = await res.json();
                    canvasManager.loadProject(json);
                } else if (activeTab === 'custom' && template.data) {
                    canvasManager.loadProject(template.data);
                }
            } catch (err) {
                console.error("Failed to load template", err);
                alert("Failed to load template.");
            }
        }
    };

    const handleSaveTemplate = () => {
        if (!canvasManager) return;

        const title = prompt("Enter a name for your template:", "My New Design");
        if (!title) return;

        try {
            // Generate Thumbnail (Small)
            const thumb = canvasManager.canvas.toDataURL({
                format: 'jpeg',
                quality: 0.7,
                multiplier: 0.2 // Small preview
            });

            // Get Data
            const json = canvasManager.canvas.toJSON();

            const newTemplate = {
                id: Date.now().toString(),
                title: title,
                thumbnail: thumb,
                data: json,
                createdAt: Date.now(),
                category: 'Custom'
            };

            const updated = [newTemplate, ...customTemplates];
            setCustomTemplates(updated);
            localStorage.setItem('canvas_pro_my_templates', JSON.stringify(updated));

            // Switch to custom tab
            setActiveTab('custom');

        } catch (err) {
            console.error("Failed to save template", err);
            if (err.name === 'QuotaExceededError') {
                alert("Storage full! Please delete some old templates.");
            } else {
                alert("Failed to save template.");
            }
        }
    };

    const handleDeleteTemplate = (e, id) => {
        e.stopPropagation();
        if (confirm("Delete this template?")) {
            const updated = customTemplates.filter(t => t.id !== id);
            setCustomTemplates(updated);
            localStorage.setItem('canvas_pro_my_templates', JSON.stringify(updated));
        }
    };

    return (
        <div className="templates-panel">

            {/* Segmented Tabs */}
            <div className="panel-tabs-segment">
                <button
                    className={`tab-segment-btn ${activeTab === 'presets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('presets')}
                >
                    Presets
                </button>
                <button
                    className={`tab-segment-btn ${activeTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('custom')}
                >
                    My Templates
                </button>
            </div>

            {/* Search Bar */}
            <div className="panel-search-box">
                <Search className="search-icon-sm" />
                <input
                    type="text"
                    placeholder={activeTab === 'presets' ? "Search presets..." : "Search my templates..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filter Tabs (Presets Only) */}
            {activeTab === 'presets' && (
                <div className="panel-category-wrapper">
                    <button className="category-nav-btn" onClick={() => handleCategoryScroll('left')} title="Scroll Left">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="panel-filter-bar" ref={categoryScrollRef}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <button className="category-nav-btn" onClick={() => handleCategoryScroll('right')} title="Scroll Right">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="templates-grid panel-scroll-area">

                {/* 'New Template' Card (Only in Custom Tab) */}
                {activeTab === 'custom' && !searchTerm && (
                    <div
                        className="template-card add-new-card"
                        onClick={handleSaveTemplate}
                        title="Save current design"
                    >
                        <div className="add-btn-circle">
                            <Plus size={24} color="white" />
                        </div>
                        <span className="add-new-text">Save Current</span>
                    </div>
                )}

                {/* Empty State */}
                {filteredTemplates.length === 0 && !(!searchTerm && activeTab === 'custom') && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888', gridColumn: '1 / -1' }}>
                        {activeTab === 'custom' ? "No saved templates yet." : "No templates found."}
                    </div>
                )}

                {filteredTemplates.map(tpl => (
                    <div
                        key={tpl.id}
                        className="template-card"
                        onClick={() => handleLoadTemplate(tpl)}
                    >
                        <div className="template-thumb">
                            <img src={tpl.thumbnail || 'placeholder.png'} alt={tpl.title} loading="lazy" />
                        </div>
                        <div className="template-info">
                            <h4>{tpl.title}</h4>
                            <span className="template-cat">
                                {activeTab === 'presets' ? tpl.category : new Date(tpl.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {activeTab === 'custom' && (
                            <button
                                className="btn-delete-template"
                                onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                                title="Delete Template"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
