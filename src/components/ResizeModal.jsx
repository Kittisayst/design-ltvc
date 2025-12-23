import React, { useState, useEffect } from 'react';
import { X, Scaling } from 'lucide-react';

const PX_PER_CM = 37.7952755906;

export function ResizeModal({ isOpen, onClose, onApply, currentWidth, currentHeight }) {
    const [unit, setUnit] = useState(() => localStorage.getItem('canvas-unit') || 'px');
    const [width, setWidth] = useState(currentWidth);
    const [height, setHeight] = useState(currentHeight);
    const [sizeTemplates, setSizeTemplates] = useState([]);

    // Fetch Size Templates
    useEffect(() => {
        fetch('data/size_templates.json')
            .then(res => res.json())
            .then(data => setSizeTemplates(data))
            .catch(err => console.error('Failed to load size templates:', err));
    }, []);

    // Sync with external changes when modal opens
    useEffect(() => {
        if (isOpen) {
            if (unit === 'cm') {
                setWidth(Number((currentWidth / PX_PER_CM).toFixed(2)));
                setHeight(Number((currentHeight / PX_PER_CM).toFixed(2)));
            } else {
                setWidth(currentWidth);
                setHeight(currentHeight);
            }
        }
    }, [isOpen, currentWidth, currentHeight, unit]);

    const handleUnitChange = (newUnit) => {
        if (newUnit === unit) return;

        if (newUnit === 'cm') {
            // px -> cm
            setWidth(Number((width / PX_PER_CM).toFixed(2)));
            setHeight(Number((height / PX_PER_CM).toFixed(2)));
        } else {
            // cm -> px
            setWidth(Math.round(width * PX_PER_CM));
            setHeight(Math.round(height * PX_PER_CM));
        }

        setUnit(newUnit);
        localStorage.setItem('canvas-unit', newUnit);
    };

    const handleApply = () => {
        let finalWidth = width;
        let finalHeight = height;

        if (unit === 'cm') {
            finalWidth = Math.round(width * PX_PER_CM);
            finalHeight = Math.round(height * PX_PER_CM);
        }

        onApply(finalWidth, finalHeight);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '360px', borderRadius: '16px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                            <Scaling size={20} color="white" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Resize Canvas</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>

                    {/* Size Templates */}
                    <div className="input-group">
                        <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>Size Templates</label>
                        <select
                            onChange={(e) => {
                                const [w, h, u] = e.target.value.split(',');
                                if (w && h) {
                                    // Directly set new values without conversion logic
                                    setUnit(u);
                                    localStorage.setItem('canvas-unit', u);
                                    setWidth(parseFloat(w));
                                    setHeight(parseFloat(h));
                                }
                            }}
                            style={{ height: '44px', cursor: 'pointer', width: '100%' }}
                            defaultValue=""
                        >
                            <option value="">Custom Size</option>
                            {sizeTemplates.map((category, catIndex) => (
                                <optgroup key={catIndex} label={category.category}>
                                    {category.items.map((item, itemIndex) => (
                                        <option key={itemIndex} value={`${item.width},${item.height},${item.unit}`}>
                                            {item.label} ({item.width} x {item.height} {item.unit})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>Measurement Unit</label>
                        <select
                            value={unit}
                            onChange={(e) => handleUnitChange(e.target.value)}
                            style={{ height: '44px', cursor: 'pointer' }}
                        >
                            <option value="px">Pixels (px) - Web Standard</option>
                            <option value="cm">Centimeters (cm) - Print Ready</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div className="input-group" style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500', fontSize: '0.8rem' }}>Width</label>
                            <div className="input-row" style={{ height: '40px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                                    step={unit === 'cm' ? '0.01' : '1'}
                                    style={{ textAlign: 'left', padding: '0', flex: 1, width: '0', minWidth: '0', border: 'none', background: 'transparent' }}
                                />
                                <span style={{ opacity: 0.5, fontSize: '0.7rem', flexShrink: 0 }}>{unit}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', color: 'var(--text-secondary)', fontWeight: 'bold', opacity: 0.4, flexShrink: 0 }}>×</div>

                        <div className="input-group" style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ marginBottom: '8px', display: 'block', fontWeight: '500', fontSize: '0.8rem' }}>Height</label>
                            <div className="input-row" style={{ height: '40px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                                    step={unit === 'cm' ? '0.01' : '1'}
                                    style={{ textAlign: 'left', padding: '0', flex: 1, width: '0', minWidth: '0', border: 'none', background: 'transparent' }}
                                />
                                <span style={{ opacity: 0.5, fontSize: '0.7rem', flexShrink: 0 }}>{unit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button className="btn" onClick={onClose} style={{ padding: '10px 20px' }}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleApply} style={{ padding: '10px 24px', borderRadius: '10px' }}>
                        Apply Resize
                    </button>
                </div>
            </div>
        </div>
    );
}
