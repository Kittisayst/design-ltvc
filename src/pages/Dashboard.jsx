import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutGrid, Share2, Monitor, Image, BarChart3, Clock, Trash2, FileText, SearchX } from 'lucide-react';

const CATEGORIES = [
    { label: 'All', icon: LayoutGrid },
    { label: 'Social Media', icon: Share2 },
    { label: 'Presentation', icon: Monitor },
    { label: 'Poster', icon: Image },
    { label: 'Infographic', icon: BarChart3 },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentProjects, setRecentProjects] = useState([]);

    // Load recent projects from localStorage
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('canvaspro_recent') || '[]');
            setRecentProjects(stored.slice(0, 6));
        } catch { setRecentProjects([]); }
    }, []);

    const clearRecent = () => {
        localStorage.removeItem('canvaspro_recent');
        setRecentProjects([]);
    };

    // Dashboard needs scrollable body
    useEffect(() => {
        document.body.classList.add('dashboard-page');
        return () => document.body.classList.remove('dashboard-page');
    }, []);

    useEffect(() => {
        async function load() {
            try {
                let res = await fetch('data/templates.json');
                if (!res.ok) res = await fetch('public/data/templates.json');
                if (!res.ok) throw new Error('Failed to load templates');
                const data = await res.json();
                setTemplates(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = templates.filter(tpl => {
        const matchCat = activeCategory === 'All' ||
            (tpl.category && tpl.category.toLowerCase() === activeCategory.toLowerCase());
        const matchSearch = !searchQuery ||
            tpl.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleTemplateClick = (tpl) => {
        if (tpl.file) {
            navigate('/editor?template=' + encodeURIComponent(tpl.file));
        } else {
            navigate('/editor');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-logo">CanvasPro</div>
                <button className="btn-create" onClick={() => navigate('/editor')}>
                    <Plus size={18} />
                    New Design
                </button>
            </div>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3><Clock size={16} /> Recent Projects</h3>
                        <button className="btn-text-sm" onClick={clearRecent} aria-label="Clear recent projects">
                            <Trash2 size={14} /> Clear
                        </button>
                    </div>
                    <div className="recent-grid">
                        {recentProjects.map((p, i) => (
                            <div key={i} className="recent-card" onClick={() => navigate('/editor')} title={p.name}>
                                <div className="recent-card-icon"><FileText size={20} /></div>
                                <div className="recent-card-info">
                                    <span className="recent-card-name">{p.name || 'Untitled'}</span>
                                    <span className="recent-card-date">{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Templates Section */}
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>Templates</h3>
                </div>

                <div className="controls-section">
                    <div className="search-box">
                        <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="tabs">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.label}
                                    className={'tab' + (activeCategory === cat.label ? ' active' : '')}
                                    onClick={() => setActiveCategory(cat.label)}
                                >
                                    <Icon size={14} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="template-grid">
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading templates...</p>
                        </div>
                    )}

                    {error && (
                        <div className="empty-state-box" style={{ gridColumn: '1/-1' }}>
                            <p style={{ color: '#ef4444' }}>Failed to load templates</p>
                            <span>Please check your connection and try again</span>
                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="empty-state-box" style={{ gridColumn: '1/-1' }}>
                            <SearchX size={32} strokeWidth={1} />
                            <p>No templates found</p>
                            <span>Try a different search or category</span>
                        </div>
                    )}

                    {!loading && !error && filtered.map(tpl => (
                        <div key={tpl.id} className="card" onClick={() => handleTemplateClick(tpl)}>
                            <div className="card-img-wrap">
                                <img src={tpl.thumbnail} alt={tpl.title} className="card-img" />
                            </div>
                            <div className="card-body">
                                <div className="card-title">{tpl.title}</div>
                                {tpl.category && (
                                    <div className="card-category">{tpl.category}</div>
                                )}
                                {tpl.updatedAt && (
                                    <div className="card-meta">
                                        {new Date(tpl.updatedAt).toLocaleDateString('en-GB')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
