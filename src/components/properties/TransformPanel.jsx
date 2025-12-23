import React from 'react';

export function TransformPanel({ activeObject, onUpdate }) {
    if (!activeObject) return null;

    const handleChange = (prop, value) => {
        let val = parseFloat(value);
        if (isNaN(val)) val = 0;
        onUpdate(prop, val);
    };

    const x = Math.round(activeObject.left || 0);
    const y = Math.round(activeObject.top || 0);
    const w = Math.round(activeObject.getScaledWidth() || 0);
    const h = Math.round(activeObject.getScaledHeight() || 0);
    const angle = Math.round(activeObject.angle || 0);
    const opacity = Math.round((activeObject.opacity || 1) * 100) / 100;

    return (
        <div className="section">
            <div className="section-title">Transform</div>
            {/* Row 1: X and Y */}
            <div className="inputs-grid-2 mb-2">
                <div className="input-group">
                    <label className="input-label">X</label>
                    <input
                        type="number"
                        className="input-field input-sm"
                        value={x}
                        onChange={(e) => handleChange('left', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Y</label>
                    <input
                        type="number"
                        className="input-field input-sm"
                        value={y}
                        onChange={(e) => handleChange('top', e.target.value)}
                    />
                </div>
            </div>

            {/* Row 2: W and H */}
            <div className="inputs-grid-2">
                <div className="input-group">
                    <label className="input-label">W</label>
                    <input
                        type="number"
                        className="input-field input-sm"
                        value={w}
                        onChange={(e) => handleChange('width', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">H</label>
                    <input
                        type="number"
                        className="input-field input-sm"
                        value={h}
                        onChange={(e) => handleChange('height', e.target.value)}
                    />
                </div>
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Rotation</label>
                    <span className="value-display" style={{ marginLeft: '8px' }}>{angle}°</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => handleChange('angle', e.target.value)}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Opacity</label>
                    <span className="value-display" style={{ marginLeft: '8px' }}>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    value={opacity}
                    onChange={(e) => handleChange('opacity', e.target.value)}
                />
            </div>
        </div>
    );
}
