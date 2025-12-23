import React, { useState } from 'react';
import { X, Download, FileJson, Image as ImageIcon, FileType } from 'lucide-react';

export function ExportModal({ isOpen, onClose, onExport }) {
    if (!isOpen) return null;

    const [format, setFormat] = useState('png');
    const [quality, setQuality] = useState(0.8);
    const [multiplier, setMultiplier] = useState(1);

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
            <div className="modal-content export-modal" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
                <div className="modal-header">
                    <h2>Export Design</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="export-options" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Format Selection */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Format</label>
                        <div className="tab-group" style={{ display: 'flex', gap: '8px' }}>
                            {['png', 'jpeg', 'pdf', 'json'].map(fmt => (
                                <button
                                    key={fmt}
                                    className={`btn ${format === fmt ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFormat(fmt)}
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scale (Multiplier) - Only for Images */}
                    {format !== 'json' && (
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Size (Multiplier)</label>
                            <div className="scale-options" style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4].map(scale => (
                                    <button
                                        key={scale}
                                        className={`btn ${multiplier === scale ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setMultiplier(scale)}
                                        style={{ flex: 1 }}
                                    >
                                        {scale}x
                                    </button>
                                ))}
                            </div>
                            <small className="text-muted" style={{ display: 'block', marginTop: '4px', fontSize: '0.85em', color: '#888' }}>
                                Resulting Resolution: {800 * multiplier} x {600 * multiplier} (Approx)
                            </small>
                        </div>
                    )}

                    {/* Quality - Only for JPEG */}
                    {format === 'jpeg' && (
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Quality: {Math.round(quality * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={quality}
                                onChange={(e) => setQuality(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Download size={16} />
                            Export
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
