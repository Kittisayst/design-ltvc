import React, { useState, useEffect, useRef } from 'react';
import './PanelCommon.css';
import './ElementLibrary.css';
import { Search, Type, Image as ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

export function ElementsPanel({ canvasManager }) {
    const [elementsData, setElementsData] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(true);

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
        // Reset input so same file can be selected again
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
                </div>
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
                            <img src={item.icon || item.src} alt={item.label} loading="lazy" />
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
