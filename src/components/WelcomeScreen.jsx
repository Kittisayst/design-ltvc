import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FilePlus, FolderOpen, Image, Layout, FileText,
    Monitor, Smartphone, Instagram, Presentation,
    Upload, X, Clock, Trash2
} from 'lucide-react';

const PRESETS = [
    { label: 'Custom', icon: FilePlus, w: 800, h: 600, desc: 'Custom size' },
    { label: 'Instagram Post', icon: Instagram, w: 1080, h: 1080, desc: '1080 × 1080' },
    { label: 'Instagram Story', icon: Smartphone, w: 1080, h: 1920, desc: '1080 × 1920' },
    { label: 'Facebook Post', icon: Image, w: 1200, h: 630, desc: '1200 × 630' },
    { label: 'Facebook Cover', icon: Layout, w: 820, h: 312, desc: '820 × 312' },
    { label: 'Presentation', icon: Presentation, w: 1920, h: 1080, desc: '16:9' },
    { label: 'A4 Portrait', icon: FileText, w: 2480, h: 3508, desc: '210 × 297 mm' },
    { label: 'A4 Landscape', icon: FileText, w: 3508, h: 2480, desc: '297 × 210 mm' },
    { label: 'HD Wallpaper', icon: Monitor, w: 1920, h: 1080, desc: '1920 × 1080' },
    { label: 'YouTube Thumbnail', icon: Image, w: 1280, h: 720, desc: '1280 × 720' },
    { label: 'Twitter Post', icon: Image, w: 1200, h: 675, desc: '1200 × 675' },
    { label: 'Poster', icon: Layout, w: 2400, h: 3600, desc: '24 × 36 in' },
];

export function WelcomeScreen({ canvasManager, onDismiss }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [customW, setCustomW] = useState(800);
    const [customH, setCustomH] = useState(600);
    const [recentProjects, setRecentProjects] = useState([]);

    // Load recent projects from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('canvaspro_recent');
            if (saved) setRecentProjects(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    const saveRecent = (name, width, height) => {
        const entry = { name, width, height, date: Date.now() };
        const updated = [entry, ...recentProjects.filter(r => r.name !== name)].slice(0, 8);
        setRecentProjects(updated);
        try { localStorage.setItem('canvaspro_recent', JSON.stringify(updated)); } catch { /* ignore */ }
    };

    const clearRecent = () => {
        setRecentProjects([]);
        try { localStorage.removeItem('canvaspro_recent'); } catch { /* ignore */ }
    };

    // Create new project with preset size
    const handleNewProject = (w, h, label) => {
        if (!canvasManager) return;
        canvasManager.resize(w, h);
        saveRecent(label || `${w}×${h}`, w, h);
        onDismiss();
    };

    // Open file (image or JSON project)
    const handleFileOpen = useCallback((file) => {
        if (!canvasManager || !file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'json') {
            // Load project JSON
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    await canvasManager.loadProject(json);
                    saveRecent(file.name, json.width || 800, json.height || 600);
                    onDismiss();
                } catch (err) {
                    console.error('Failed to load project:', err);
                }
            };
            reader.readAsText(file);
        } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
            // Load image and auto-resize canvas
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    // Auto-resize canvas to image dimensions
                    const w = img.naturalWidth;
                    const h = img.naturalHeight;
                    canvasManager.resize(w, h);

                    // Add image to canvas
                    canvasManager.shapeManager.addImage(e.target.result);
                    saveRecent(file.name, w, h);
                    onDismiss();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }, [canvasManager, onDismiss]);

    const handleBrowseClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileOpen(file);
    };

    // Drag & Drop
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileOpen(file);
    };

    return (
        <div className="welcome-overlay" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {/* Close button */}
            <button className="welcome-close" onClick={onDismiss} title="Skip to editor">
                <X size={20} />
            </button>

            <div className="welcome-container">
                {/* Header */}
                <div className="welcome-header">
                    <h1 className="welcome-title">CanvasPro Studio</h1>
                    <p className="welcome-subtitle">Create stunning designs with ease</p>
                </div>

                <div className="welcome-content">
                    {/* Left: New Project + Presets */}
                    <div className="welcome-section welcome-section-main">
                        <h2 className="welcome-section-title">
                            <FilePlus size={18} /> New Project
                        </h2>

                        {/* Custom size input */}
                        <div className="welcome-custom-size">
                            <div className="welcome-size-inputs">
                                <label>
                                    <span>W</span>
                                    <input type="number" value={customW} onChange={e => setCustomW(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="10000" />
                                </label>
                                <span className="welcome-size-x">×</span>
                                <label>
                                    <span>H</span>
                                    <input type="number" value={customH} onChange={e => setCustomH(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="10000" />
                                </label>
                                <button className="welcome-btn-create" onClick={() => handleNewProject(customW, customH, 'Custom')}>
                                    Create
                                </button>
                            </div>
                        </div>

                        {/* Preset grid */}
                        <div className="welcome-presets">
                            {PRESETS.slice(1).map((p) => (
                                <button key={p.label} className="welcome-preset-card" onClick={() => handleNewProject(p.w, p.h, p.label)}>
                                    <p.icon size={22} className="welcome-preset-icon" />
                                    <span className="welcome-preset-label">{p.label}</span>
                                    <span className="welcome-preset-desc">{p.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Open File + Drop Zone + Recent */}
                    <div className="welcome-section welcome-section-side">
                        {/* Open File */}
                        <h2 className="welcome-section-title">
                            <FolderOpen size={18} /> Open File
                        </h2>

                        {/* Drop Zone */}
                        <div className={`welcome-dropzone ${isDragging ? 'dragging' : ''}`}
                            onClick={handleBrowseClick}>
                            <Upload size={32} className="welcome-drop-icon" />
                            <p className="welcome-drop-text">
                                {isDragging ? 'Drop file here...' : 'Drag & drop image or project'}
                            </p>
                            <p className="welcome-drop-hint">PNG, JPG, SVG, WebP, or .json project</p>
                            <button className="welcome-btn-browse">Browse Files</button>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.json"
                            onChange={handleFileChange} style={{ display: 'none' }} />

                        {/* Templates shortcut */}
                        <button className="welcome-btn-templates" onClick={() => { navigate('/'); }}>
                            <Layout size={16} />
                            Browse Templates
                        </button>

                        {/* Recent Projects */}
                        {recentProjects.length > 0 && (
                            <div className="welcome-recent">
                                <div className="welcome-recent-header">
                                    <h3><Clock size={14} /> Recent</h3>
                                    <button onClick={clearRecent} title="Clear recent"><Trash2 size={12} /></button>
                                </div>
                                <div className="welcome-recent-list">
                                    {recentProjects.map((r, i) => (
                                        <button key={i} className="welcome-recent-item"
                                            onClick={() => handleNewProject(r.width, r.height, r.name)}>
                                            <span className="welcome-recent-name">{r.name}</span>
                                            <span className="welcome-recent-size">{r.width}×{r.height}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
