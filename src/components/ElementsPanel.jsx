import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import './PanelCommon.css';
import './ElementLibrary.css';
import { Search, Type, TextCursorInput, Upload, ChevronLeft, ChevronRight, ImageDown, QrCode, ScanBarcode, Smile, Shapes, PieChart } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { StockPhotosPanel } from './elements/StockPhotosPanel';
import { QRCodePanel } from './elements/QRCodePanel';
import { BarcodePanel } from './elements/BarcodePanel';
import { IconSearchPanel } from './elements/IconSearchPanel';
import { renderShapeIcon } from './elements/ShapeGrid';

// Heavy panels lazy-loaded (Chart.js ~200KB, emoji-picker ~150KB)
const EmojiPanel = lazy(() => import('./elements/EmojiPanel').then(m => ({ default: m.EmojiPanel })));
const ChartPanel = lazy(() => import('./elements/ChartPanel').then(m => ({ default: m.ChartPanel })));

export function ElementsPanel() {
    const { canvasManager } = useCanvas();
    const [elementsData, setElementsData] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(true);

    const [viewMode, setViewMode] = useState('default');

    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const categoryScrollRef = useRef(null);

    useEffect(() => {
        fetch('data/elements.json')
            .then(res => res.json())
            .then(data => {
                setElementsData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error loading elements:', err);
                setIsLoading(false);
            });
    }, []);

    const categories = ['All', ...elementsData.map(cat => cat.category)];

    const handleCategoryScroll = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = 150;
            if (direction === 'left') {
                categoryScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setDisplayLimit(prev => prev + 20);
            }
        }
    };

    const handleAddText = () => {
        if (canvasManager) {
            canvasManager.addText('Heading', { fontSize: 48, fontWeight: 'bold' });
        }
    };

    const handleAddTextOnPath = (pathType) => {
        if (canvasManager?.textOnPathManager) {
            canvasManager.textOnPathManager.addTextOnPath('Text on Path', pathType);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleElementClick = (item) => {
        if (!canvasManager) return;
        if (item.type === 'shape') {
            canvasManager.addShape(item.shapeType, item.options);
        } else if (item.type === 'svg') {
            canvasManager.addSVG(item.src);
        } else if (item.type === 'image') {
            canvasManager.addImage(item.src);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && canvasManager) {
            const reader = new FileReader();
            reader.onload = (f) => {
                canvasManager.addImage(f.target.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    // Filter and Search Logic
    const allFilteredItems = elementsData.flatMap(cat =>
        cat.items.map(item => ({ ...item, category: cat.category }))
    ).filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filteredItems = allFilteredItems.slice(0, displayLimit);

    if (isLoading) {
        return <div style={{ padding: '20px', color: '#888' }}>Loading...</div>;
    }

    // --- SUB-PANEL VIEWS ---
    const goBack = () => setViewMode('default');
    if (viewMode === 'stock') return <StockPhotosPanel onBack={goBack} />;
    if (viewMode === 'qrcode') return <QRCodePanel onBack={goBack} />;
    if (viewMode === 'barcode') return <BarcodePanel onBack={goBack} />;
    if (viewMode === 'emoji') return <Suspense fallback={<div style={{ padding: '20px', color: '#888' }}>Loading...</div>}><EmojiPanel onBack={goBack} /></Suspense>;
    if (viewMode === 'icon') return <IconSearchPanel onBack={goBack} />;
    if (viewMode === 'chart') return <Suspense fallback={<div style={{ padding: '20px', color: '#888' }}>Loading...</div>}><ChartPanel onBack={goBack} /></Suspense>;

    // --- DEFAULT VIEW ---
    return (
        <div className="elements-panel">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Quick Actions / Basics */}
            <div className="elements-basics-section">
                <div className="section-title">BASICS</div>
                <div className="elements-basics-grid">
                    <button className="btn-element-primary" onClick={handleAddText} title="Add Text">
                        <Type size={18} />
                        <span>Text</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => handleAddTextOnPath('arc')} title="Text on Arc">
                        <TextCursorInput size={18} />
                        <span>Curved</span>
                    </button>
                    <button className="btn-element-primary" onClick={handleUploadClick} title="Upload Image">
                        <Upload size={18} />
                        <span>Upload</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('stock')} title="Stock Photos">
                        <ImageDown size={18} />
                        <span>Stock</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('icon')} title="Icons">
                        <Shapes size={18} />
                        <span>Icons</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('qrcode')} title="QR Code">
                        <QrCode size={18} />
                        <span>QR Code</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('barcode')} title="Barcode">
                        <ScanBarcode size={18} />
                        <span>Barcode</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('emoji')} title="Emoji">
                        <Smile size={18} />
                        <span>Emoji</span>
                    </button>
                    <button className="btn-element-primary" onClick={() => setViewMode('chart')} title="Charts">
                        <PieChart size={18} />
                        <span>Charts</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="panel-search-box">
                <Search size={16} className="search-icon-sm" />
                <input
                    type="text"
                    placeholder="Search elements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Categories */}
            <div className="panel-category-wrapper">
                <button className="category-nav-btn" onClick={() => handleCategoryScroll('left')} title="Scroll Left">
                    <ChevronLeft size={16} />
                </button>
                <div className="panel-filter-bar" ref={categoryScrollRef}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="category-nav-btn" onClick={() => handleCategoryScroll('right')} title="Scroll Right">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Scrollable Grid Area */}
            <div
                className="panel-scroll-area"
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                <div className="elements-grid-flat">
                    {filteredItems.map((item, index) => (
                        <button
                            key={index}
                            className="btn-element-flat"
                            onClick={() => handleElementClick(item)}
                            title={item.label}
                        >
                            <div className="element-preview" style={{ width: '100%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.type === 'shape' ? (
                                    <div style={{ width: '40px', height: '40px' }}>
                                        {renderShapeIcon(item.shapeType, item.options?.fill || '#888')}
                                    </div>
                                ) : (
                                    <img src={item.icon || item.src} alt={item.label} loading="lazy" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                )}
                            </div>
                        </button>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            No elements found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
