import React, { useState } from 'react';
import { X, Download, FileImage, FileType } from 'lucide-react';
import './ExportModal.css';

export function ExportModal({ isOpen, onClose, onExport }) {
    if (!isOpen) return null;

    const [format, setFormat] = useState('png');
    const [quality, setQuality] = useState(0.8);
    const [multiplier, setMultiplier] = useState(2); // Default to 2x for better quality

    const handleExport = () => {
        onExport({
            format,
            quality: parseFloat(quality),
            multiplier: parseFloat(multiplier)
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content export-modal" onClick={e => e.stopPropagation()} style={{ width: '420px' }}>
                <div className="modal-header">
                    <h2>Export Design</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="export-content">
                    {/* Format Selection */}
                    <div className="form-group">
                        <label className="form-label">Format</label>
                        <div className="format-grid">
                            {['png', 'jpeg', 'pdf'].map(fmt => (
                                <button
                                    key={fmt}
                                    className={`format-btn ${format === fmt ? 'active' : ''}`}
                                    onClick={() => setFormat(fmt)}
                                >
                                    {fmt === 'pdf' ? <FileType size={16} /> : <FileImage size={16} />}
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scale (Multiplier) */}
                    <div className="form-group">
                        <label className="form-label">
                            Resolution (Scale)
                            <span className="info-text">Target: {800 * multiplier} x {600 * multiplier} px</span>
                        </label>
                        <div className="scale-options">
                            {[1, 2, 3, 4].map(scale => (
                                <button
                                    key={scale}
                                    className={`scale-btn ${multiplier === scale ? 'active' : ''}`}
                                    onClick={() => setMultiplier(scale)}
                                >
                                    {scale}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality - Only for JPEG */}
                    {format === 'jpeg' && (
                        <div className="form-group">
                            <label className="form-label">
                                Quality
                                <span className="value-display">{Math.round(quality * 100)}%</span>
                            </label>
                            <div className="quality-slider-container">
                                <input
                                    type="range"
                                    className="range-slider"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-export" onClick={handleExport}>
                        <Download size={18} />
                        Export {format.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
}
