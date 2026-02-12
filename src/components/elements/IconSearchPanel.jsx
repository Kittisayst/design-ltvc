import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { IconService } from '../../services/IconService';
import { useCanvas } from '../../context/CanvasContext';

export function IconSearchPanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const [iconQuery, setIconQuery] = useState('');
    const [iconResults, setIconResults] = useState([]);
    const [iconLoading, setIconLoading] = useState(false);

    const handleIconSearch = async () => {
        if (!iconQuery.trim()) return;
        setIconLoading(true);
        setIconResults([]);
        try {
            const icons = await IconService.searchIcons(iconQuery);
            setIconResults(icons);
        } catch (error) {
            console.error("Icon search failed:", error);
        } finally {
            setIconLoading(false);
        }
    };

    const handleIconClick = async (iconName) => {
        if (!canvasManager) return;
        try {
            const svgString = await IconService.getIconSVG(iconName);
            if (svgString) {
                await canvasManager.addSVGString(svgString, { scaleX: 5, scaleY: 5 });
            }
        } catch (error) {
            console.error("Failed to add icon:", error);
        }
    };

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Icon Library</span>
            </div>

            <div className="panel-search-box" style={{ margin: '10px 15px' }}>
                <Search size={16} className="search-icon-sm" />
                <input
                    type="text"
                    placeholder="Search icons (e.g. home, user)..."
                    value={iconQuery}
                    onChange={(e) => setIconQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIconSearch()}
                />
            </div>

            <div className="panel-scroll-area">
                {iconLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Searching...</div>
                ) : (
                    <div className="elements-grid-flat" style={{ padding: '0 15px 20px', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}>
                        {iconResults.map((iconName) => (
                            <button
                                key={iconName}
                                className="btn-element-flat"
                                onClick={() => handleIconClick(iconName)}
                                title={iconName}
                                style={{ padding: '10px' }}
                            >
                                <img
                                    src={IconService.getIconPreviewUrl(iconName)}
                                    alt={iconName}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    loading="lazy"
                                />
                            </button>
                        ))}
                        {iconResults.length === 0 && iconQuery && !iconLoading && (
                            <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: '#888', gridColumn: '1 / -1' }}>
                                No icons found
                            </div>
                        )}
                        {!iconQuery && iconResults.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.85rem', lineHeight: '1.4', gridColumn: '1 / -1' }}>
                                Search for thousands of vector icons.<br />Powered by <b>Iconify</b>.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
