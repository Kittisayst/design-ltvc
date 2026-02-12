import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = ['All', 'Social Media', 'Presentation', 'Poster', 'Infographic'];

export default function Dashboard() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
                <div className="dashboard-logo">CanvasPro Dashboard</div>
                <button className="btn-create" onClick={() => navigate('/editor')}>
                    <Plus size={20} />
                    Create Blank
                </button>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <Search size={20} style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="tabs">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={'tab' + (activeCategory === cat ? ' active' : '')}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
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
                    <div className="loading-state">
                        <p style={{ color: '#ef4444' }}>Failed to load templates. Please try again later.</p>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No templates found matching your criteria.
                    </div>
                )}

                {!loading && !error && filtered.map(tpl => (
                    <div key={tpl.id} className="card" onClick={() => handleTemplateClick(tpl)}>
                        <img src={tpl.thumbnail} alt={tpl.title} className="card-img" />
                        <div className="card-body">
                            <div className="card-title">{tpl.title}</div>
                            {tpl.updatedAt && (
                                <div className="card-meta">
                                    Updated: {new Date(tpl.updatedAt).toLocaleDateString('en-GB')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
