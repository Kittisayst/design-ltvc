import React, { useState, useEffect, useRef } from 'react';
import './PanelCommon.css';
import './ElementLibrary.css';
import { Search, Type, Image as ImageIcon, Upload, ChevronLeft, ChevronRight, ImageDown, ArrowLeft, Key, QrCode, ScanBarcode, Smile, Shapes, PieChart } from 'lucide-react';
import { StockPhotoService } from '../services/StockPhotoService';
import { IconService } from '../services/IconService';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import EmojiPicker from 'emoji-picker-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function ElementsPanel({ canvasManager }) {
    const [elementsData, setElementsData] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(true);

    // Stock Photo State
    const [viewMode, setViewMode] = useState('default'); // 'default', 'stock', 'qrcode', 'barcode'
    const [stockQuery, setStockQuery] = useState('');
    const [stockPhotos, setStockPhotos] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [apiKey, setApiKey] = useState(StockPhotoService.getApiKey() || '');
    const [hasValidKey, setHasValidKey] = useState(!!StockPhotoService.getApiKey());
    const [stockPage, setStockPage] = useState(1);

    // QR Code State
    const [qrText, setQrText] = useState('');
    const [qrColor, setQrColor] = useState('#000000');

    // Barcode State
    const [barcodeText, setBarcodeText] = useState('');
    const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
    const [barcodeLineColor, setBarcodeLineColor] = useState('#000000');
    const [barcodeShowText, setBarcodeShowText] = useState(true);

    // Icon State
    const [iconQuery, setIconQuery] = useState('');
    const [iconResults, setIconResults] = useState([]);
    const [iconLoading, setIconLoading] = useState(false);

    // Chart State
    // Chart State
    const [chartType, setChartType] = useState('bar');
    const [chartLabels, setChartLabels] = useState('Jan,Feb,Mar,Apr,May');
    const [chartData, setChartData] = useState('12,19,3,5,2');
    const [chartLabel, setChartLabel] = useState('Sales');
    const [chartColor, setChartColor] = useState('#3498db');
    const [chartFont, setChartFont] = useState('Arial');
    const chartRef = useRef(null);

    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const categoryScrollRef = useRef(null);
    const stockScrollRef = useRef(null);

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

    const handleStockScroll = () => {
        // Infinite scroll for stock photos could be implemented here
    };

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
        setStockPhotos([]); // Clear previous
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

    const handleAddQrCode = async () => {
        if (!canvasManager || !qrText.trim()) return;
        try {
            const svgString = await QRCode.toString(qrText, {
                type: 'svg',
                color: {
                    dark: qrColor,
                    light: '#00000000' // Transparent background
                },
                margin: 1
            });
            await canvasManager.addSVGString(svgString, { scaleX: 1, scaleY: 1 });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBarcode = async () => {
        if (!canvasManager || !barcodeText.trim()) return;
        try {
            const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            JsBarcode(svgNode, barcodeText, {
                format: barcodeFormat,
                lineColor: barcodeLineColor,
                displayValue: barcodeShowText,
                background: '#ffffff00', // Transparent
                margin: 0
            });
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgNode);
            await canvasManager.addSVGString(svgString, { scaleX: 1, scaleY: 1 });
        } catch (err) {
            console.error("Barcode generation failed:", err);
            alert("Failed to generate Barcode. Check format or value.");
        }
    };

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

    const handleAddChart = () => {
        if (!chartRef.current || !canvasManager) return;
        try {
            const base64Image = chartRef.current.toBase64Image();
            canvasManager.addImage(base64Image);
        } catch (err) {
            console.error("Failed to add chart to canvas", err);
        }
    };

    const handleEmojiClick = (emojiData) => {
        if (canvasManager) {
            canvasManager.addText(emojiData.emoji, { fontSize: 72 });
        }
    };

    const handleAddText = () => {
        if (canvasManager) {
            canvasManager.addText('Heading', { fontSize: 48, fontWeight: 'bold' });
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

    // --- STOCK PHOTOS VIEW ---
    if (viewMode === 'stock') {
        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
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

    // --- QR CODE VIEW ---
    if (viewMode === 'qrcode') {
        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 600 }}>QR Code Generator</span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label className="input-label">Content / URL</label>
                        <input
                            type="text"
                            className="panel-input"
                            placeholder="https://example.com"
                            value={qrText}
                            onChange={(e) => setQrText(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Color</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={qrColor}
                                onChange={(e) => setQrColor(e.target.value)}
                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: '#888' }}>{qrColor}</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddQrCode}
                        disabled={!qrText.trim()}
                        style={{ marginTop: '10px' }}
                    >
                        Generate QR Code
                    </button>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.8rem', color: '#888', lineHeight: '1.5' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> The QR Code is generated as a <b>Vector (SVG)</b> object. You can scale it infinitely without losing quality!
                    </div>
                </div>
            </div>
        );
    }

    // --- BARCODE VIEW ---
    if (viewMode === 'barcode') {
        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 600 }}>Barcode Generator</span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label className="input-label">Value</label>
                        <input
                            type="text"
                            className="panel-input"
                            placeholder="12345678"
                            value={barcodeText}
                            onChange={(e) => setBarcodeText(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Format</label>
                        <select
                            className="panel-select"
                            value={barcodeFormat}
                            onChange={(e) => setBarcodeFormat(e.target.value)}
                        >
                            <option value="CODE128">CODE128 (Standard)</option>
                            <option value="EAN13">EAN13 (Product)</option>
                            <option value="UPC">UPC (US Retail)</option>
                            <option value="ITF">ITF</option>
                            <option value="MSI">MSI</option>
                            <option value="codabar">Codabar</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <label className="input-label" style={{ marginBottom: 0 }}>Color</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                <input
                                    type="color"
                                    value={barcodeLineColor}
                                    onChange={(e) => setBarcodeLineColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={barcodeShowText}
                                onChange={(e) => setBarcodeShowText(e.target.checked)}
                                id="showTextCheck"
                            />
                            <label htmlFor="showTextCheck" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Show Numbers</label>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddBarcode}
                        disabled={!barcodeText.trim()}
                        style={{ marginTop: '10px' }}
                    >
                        Generate Barcode
                    </button>
                </div>
            </div>
        );
    }

    // --- EMOJI VIEW ---
    if (viewMode === 'emoji') {
        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 600 }}>Emoji Picker</span>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme="dark"
                        width="100%"
                        height="100%"
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            </div>
        );
    }

    // --- ICON VIEW ---
    if (viewMode === 'icon') {
        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
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

    // --- CHART VIEW ---
    if (viewMode === 'chart') {
        const labels = chartLabels.split(',').map(s => s.trim());
        const dataPoints = chartData.split(',').map(s => parseFloat(s.trim()) || 0);

        const data = {
            labels,
            datasets: [
                {
                    label: chartLabel,
                    data: dataPoints,
                    backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                        ? [chartColor, '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#34495e']
                        : chartColor,
                    borderColor: chartType === 'line' ? chartColor : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: chartFont } }
                },
                title: {
                    display: true,
                    text: chartLabel,
                    font: { family: chartFont, size: 16 }
                },
                tooltip: {
                    bodyFont: { family: chartFont },
                    titleFont: { family: chartFont }
                }
            },
            scales: {
                x: { ticks: { font: { family: chartFont } } },
                y: { ticks: { font: { family: chartFont } } }
            }
        };

        // For Pie/Doughnut, remove scales/axes
        if (chartType === 'pie' || chartType === 'doughnut') {
            delete options.scales;
        }

        return (
            <div className="elements-panel">
                <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <button className="icon-btn" onClick={() => setViewMode('default')} title="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 600 }}>Chart Generator</span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                    <div style={{ height: '200px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px' }}>
                        {chartType === 'bar' && <Bar ref={chartRef} data={data} options={options} />}
                        {chartType === 'line' && <Line ref={chartRef} data={data} options={options} />}
                        {chartType === 'pie' && <Pie ref={chartRef} data={data} options={options} />}
                        {chartType === 'doughnut' && <Doughnut ref={chartRef} data={data} options={options} />}
                    </div>

                    <div>
                        <label className="input-label">Chart Type</label>
                        <select
                            className="panel-select"
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                        >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="doughnut">Doughnut Chart</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Font Family</label>
                        <select
                            className="panel-select"
                            value={chartFont}
                            onChange={(e) => setChartFont(e.target.value)}
                        >
                            <option value="Arial">Arial (Standard)</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Impact">Impact</option>
                            <option value="'Phetsarath OT', sans-serif">Phetsarath OT (Lao)</option>
                            <option value="'Noto Sans Lao', sans-serif">Noto Sans Lao</option>
                        </select>
                    </div>

                    {/* ... rest of inputs ... */}
                    <div>
                        <label className="input-label">Dataset Label</label>
                        <input
                            type="text"
                            className="panel-input"
                            value={chartLabel}
                            onChange={(e) => setChartLabel(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Labels (comma separated)</label>
                        <input
                            type="text"
                            className="panel-input"
                            value={chartLabels}
                            onChange={(e) => setChartLabels(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Data (comma separated)</label>
                        <input
                            type="text"
                            className="panel-input"
                            value={chartData}
                            onChange={(e) => setChartData(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Primary Color</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={chartColor}
                                onChange={(e) => setChartColor(e.target.value)}
                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: '#888' }}>{chartColor}</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddChart}
                        style={{ marginTop: '10px' }}
                    >
                        Add Chart to Canvas
                    </button>
                    <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                        Added as a high-res Image object
                    </div>
                </div>
            </div>
        );
    }

    // --- DYNAMIC SHAPE ICON RENDERER ---
    const renderShapeIcon = (shapeType, color = '#ccc') => {
        const size = 40;
        const style = { width: '100%', height: '100%', display: 'block' };

        switch (shapeType) {
            case 'rect':
                return <svg viewBox="0 0 100 100" style={style}><rect x="10" y="25" width="80" height="50" fill={color} rx="4" /></svg>;
            case 'circle':
                return <svg viewBox="0 0 100 100" style={style}><circle cx="50" cy="50" r="40" fill={color} /></svg>;
            case 'triangle':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="50,15 15,85 85,85" fill={color} /></svg>;
            case 'right_triangle':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="20,20 20,80 80,80" fill={color} /></svg>;
            case 'diamond':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="50,20 80,50 50,80 20,50" fill={color} /></svg>;
            case 'parallelogram':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="30,20 90,20 70,80 10,80" fill={color} /></svg>;
            case 'trapezoid':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="30,20 70,20 90,80 10,80" fill={color} /></svg>;
            case 'star':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
            case 'pentagon':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9 12 2z" /></svg>;
            case 'hexagon':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M21 16.5l-9 5.2-9-5.2v-9l9-5.2 9 5.2v9z" /></svg>;
            case 'cross':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="35,20 65,20 65,35 80,35 80,65 65,65 65,80 35,80 35,65 20,65 20,35 35,35" fill={color} /></svg>;
            case 'cloud':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>;
            case 'burst':
                return <svg viewBox="0 0 100 100" style={style}><polygon points="50,10 60,35 85,25 75,45 95,60 70,70 65,95 50,80 35,95 30,70 5,60 25,45 15,25 40,35" fill={color} /></svg>;
            case 'lightning':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>;
            case 'arrow':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M5 12h10v5l5-5-5-5v5H5v-5z" /></svg>; // Right arrow
            case 'message_box':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>;
            case 'heart':
                return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
            default:
                return <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '4px' }} />;
        }
    };

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
