import React, { useState, useRef } from 'react';
import { Search, ArrowLeft, Key } from 'lucide-react';
import { StockPhotoService } from '../../services/StockPhotoService';
import { useCanvas } from '../../context/CanvasContext';

export function StockPhotosPanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const [stockQuery, setStockQuery] = useState('');
    const [stockPhotos, setStockPhotos] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [apiKey, setApiKey] = useState(StockPhotoService.getApiKey() || '');
    const [hasValidKey, setHasValidKey] = useState(!!StockPhotoService.getApiKey());
    const stockScrollRef = useRef(null);

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            StockPhotoService.setApiKey(apiKey.trim());
            setHasValidKey(true);
        }
    };

    const handleClearApiKey = () => {
        StockPhotoService.removeApiKey();
        setHasValidKey(false);
        setApiKey('');
        setStockPhotos([]);
    };

    const handleStockSearch = async () => {
        if (!stockQuery.trim()) return;
        setStockLoading(true);
        setStockPhotos([]);
        try {
            const data = await StockPhotoService.searchPhotos(stockQuery, 1, 30);
            if (data && data.results) {
                setStockPhotos(data.results);
            }
        } catch (error) {
            console.error("Stock search failed:", error);
            if (error.message === 'Invalid Access Key') {
                alert("Invalid Access Key. Please check and try again.");
                handleClearApiKey();
            } else {
                alert("Failed to search photos. Check console.");
            }
        } finally {
            setStockLoading(false);
        }
    };

    const handleStockPhotoClick = async (photo) => {
        if (!canvasManager) return;
        const imageUrl = photo.urls.regular;
        StockPhotoService.triggerDownload(photo.links.download_location);
        await canvasManager.addImage(imageUrl);
    };

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Unsplash Photos</span>
                {hasValidKey && (
                    <button className="icon-btn" onClick={handleClearApiKey} title="Change Key" style={{ marginLeft: 'auto' }}>
                        <Key size={16} />
                    </button>
                )}
            </div>

            {!hasValidKey ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.4' }}>
                        Please enter your <b>Unsplash Access Key</b> to search for photos.
                        <br />
                        <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Get a key here</a>.
                    </div>
                    <input
                        type="password"
                        className="panel-input"
                        placeholder="Paste Access Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSaveApiKey}>Save Key</button>
                </div>
            ) : (
                <>
                    <div className="panel-search-box" style={{ margin: '10px 15px' }}>
                        <Search size={16} className="search-icon-sm" />
                        <input
                            type="text"
                            placeholder="Search Unsplash..."
                            value={stockQuery}
                            onChange={(e) => setStockQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStockSearch()}
                        />
                    </div>

                    <div className="panel-scroll-area" ref={stockScrollRef}>
                        {stockLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Searching...</div>
                        ) : (
                            <div className="elements-grid-flat" style={{ padding: '0 15px 20px' }}>
                                {stockPhotos.map((photo) => (
                                    <div key={photo.id} className="stock-photo-item" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleStockPhotoClick(photo)}>
                                        <img
                                            src={photo.urls.small}
                                            alt={photo.alt_description}
                                            style={{ width: '100%', borderRadius: '4px', display: 'block' }}
                                            loading="lazy"
                                        />
                                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            by {photo.user.name}
                                        </div>
                                    </div>
                                ))}
                                {stockPhotos.length === 0 && stockQuery && !stockLoading && (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                        No photos found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '5px 15px', fontSize: '0.7rem', color: '#666', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                        Photos provided by <a href="https://unsplash.com/?utm_source=PosterDesignerPro&utm_medium=referral" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Unsplash</a>
                    </div>
                </>
            )}
        </div>
    );
}
