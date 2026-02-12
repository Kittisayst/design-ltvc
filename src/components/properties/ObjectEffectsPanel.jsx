import React, { useState, useEffect } from 'react';
import { Shadow } from 'fabric';

const BLEND_MODES = [
    'source-over', 'multiply', 'screen', 'overlay', 'darken',
    'lighten', 'color-dodge', 'color-burn', 'hard-light',
    'soft-light', 'difference', 'exclusion'
];

export function ObjectEffectsPanel({ activeObject, canvasManager, onUpdate }) {
    const [shadowEnabled, setShadowEnabled] = useState(false);
    const [shadowColor, setShadowColor] = useState('#000000');
    const [shadowBlur, setShadowBlur] = useState(10);
    const [shadowOffsetX, setShadowOffsetX] = useState(5);
    const [shadowOffsetY, setShadowOffsetY] = useState(5);
    const [shadowOpacity, setShadowOpacity] = useState(0.5);
    const [blendMode, setBlendMode] = useState('source-over');
    const [borderWidth, setBorderWidth] = useState(0);
    const [borderColor, setBorderColor] = useState('#000000');
    const [cornerRadius, setCornerRadius] = useState(0);

    // Sync state from active object
    useEffect(() => {
        if (!activeObject) return;

        // Shadow
        const shadow = activeObject.shadow;
        if (shadow) {
            setShadowEnabled(true);
            setShadowColor(shadow.color?.replace(/rgba?\([^)]+\)/, shadow.color) || '#000000');
            setShadowBlur(shadow.blur || 10);
            setShadowOffsetX(shadow.offsetX || 5);
            setShadowOffsetY(shadow.offsetY || 5);
            // Extract opacity from rgba
            const match = shadow.color?.match(/[\d.]+(?=\))/);
            setShadowOpacity(match ? parseFloat(match[0]) : 0.5);
        } else {
            setShadowEnabled(false);
        }

        // Blend mode
        setBlendMode(activeObject.globalCompositeOperation || 'source-over');

        // Border (stroke)
        setBorderWidth(activeObject.strokeWidth || 0);
        setBorderColor(activeObject.stroke || '#000000');

        // Corner radius (rx/ry for rect)
        if (activeObject.type === 'rect') {
            setCornerRadius(activeObject.rx || 0);
        } else {
            setCornerRadius(0);
        }
    }, [activeObject]);

    const applyShadow = (enabled, color, blur, offX, offY, opacity) => {
        if (!activeObject || !canvasManager) return;
        if (enabled) {
            const hexColor = color.startsWith('#') ? color : '#000000';
            // Convert hex + opacity to rgba
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const rgba = `rgba(${r},${g},${b},${opacity})`;

            activeObject.set('shadow', new Shadow({
                color: rgba,
                blur: blur,
                offsetX: offX,
                offsetY: offY,
            }));
        } else {
            activeObject.set('shadow', null);
        }
        canvasManager.canvas.requestRenderAll();
    };

    const handleShadowToggle = () => {
        const next = !shadowEnabled;
        setShadowEnabled(next);
        applyShadow(next, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity);
    };

    const handleShadowChange = (prop, value) => {
        let c = shadowColor, b = shadowBlur, ox = shadowOffsetX, oy = shadowOffsetY, op = shadowOpacity;
        if (prop === 'color') { c = value; setShadowColor(value); }
        if (prop === 'blur') { b = value; setShadowBlur(value); }
        if (prop === 'offsetX') { ox = value; setShadowOffsetX(value); }
        if (prop === 'offsetY') { oy = value; setShadowOffsetY(value); }
        if (prop === 'opacity') { op = value; setShadowOpacity(value); }
        applyShadow(true, c, b, ox, oy, op);
    };

    const handleBlendMode = (mode) => {
        setBlendMode(mode);
        if (activeObject && canvasManager) {
            activeObject.set('globalCompositeOperation', mode);
            canvasManager.canvas.requestRenderAll();
        }
    };

    const handleBorderWidth = (w) => {
        setBorderWidth(w);
        if (activeObject && canvasManager) {
            activeObject.set('strokeWidth', w);
            if (w > 0 && !activeObject.stroke) {
                activeObject.set('stroke', borderColor);
            }
            canvasManager.canvas.requestRenderAll();
        }
    };

    const handleBorderColor = (c) => {
        setBorderColor(c);
        if (activeObject && canvasManager) {
            activeObject.set('stroke', c);
            canvasManager.canvas.requestRenderAll();
        }
    };

    const handleCornerRadius = (r) => {
        setCornerRadius(r);
        if (activeObject && canvasManager && activeObject.type === 'rect') {
            activeObject.set({ rx: r, ry: r });
            canvasManager.canvas.requestRenderAll();
        }
    };

    if (!activeObject) return null;

    const isRect = activeObject.type === 'rect';
    const sectionStyle = { marginBottom: '12px' };
    const labelStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' };
    const inputLabelStyle = { fontSize: '0.8em', color: 'var(--text-secondary)' };
    const valueStyle = { fontSize: '0.8em', color: 'var(--text-secondary)', opacity: 0.7 };

    return (
        <div className="section">
            <div className="section-title">Effects</div>

            {/* Drop Shadow */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={shadowEnabled} onChange={handleShadowToggle}
                            style={{ accentColor: 'var(--primary-color)' }} />
                        Drop Shadow
                    </label>
                </div>
                {shadowEnabled && (
                    <div style={{ paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={labelStyle}>
                            <span style={inputLabelStyle}>Color</span>
                            <input type="color" value={shadowColor}
                                onChange={e => handleShadowChange('color', e.target.value)}
                                style={{ width: '24px', height: '20px', border: 'none', cursor: 'pointer', background: 'none' }} />
                        </div>
                        <div style={labelStyle}>
                            <span style={inputLabelStyle}>Blur</span>
                            <span style={valueStyle}>{shadowBlur}</span>
                        </div>
                        <input type="range" className="range-slider" min="0" max="50" step="1"
                            value={shadowBlur} onChange={e => handleShadowChange('blur', parseInt(e.target.value))} />
                        <div style={labelStyle}>
                            <span style={inputLabelStyle}>Offset X</span>
                            <span style={valueStyle}>{shadowOffsetX}</span>
                        </div>
                        <input type="range" className="range-slider" min="-30" max="30" step="1"
                            value={shadowOffsetX} onChange={e => handleShadowChange('offsetX', parseInt(e.target.value))} />
                        <div style={labelStyle}>
                            <span style={inputLabelStyle}>Offset Y</span>
                            <span style={valueStyle}>{shadowOffsetY}</span>
                        </div>
                        <input type="range" className="range-slider" min="-30" max="30" step="1"
                            value={shadowOffsetY} onChange={e => handleShadowChange('offsetY', parseInt(e.target.value))} />
                        <div style={labelStyle}>
                            <span style={inputLabelStyle}>Opacity</span>
                            <span style={valueStyle}>{Math.round(shadowOpacity * 100)}%</span>
                        </div>
                        <input type="range" className="range-slider" min="0" max="1" step="0.05"
                            value={shadowOpacity} onChange={e => handleShadowChange('opacity', parseFloat(e.target.value))} />
                    </div>
                )}
            </div>

            {/* Blend Mode */}
            <div style={sectionStyle}>
                <div style={labelStyle}>
                    <span style={inputLabelStyle}>Blend Mode</span>
                </div>
                <select value={blendMode} onChange={e => handleBlendMode(e.target.value)}
                    style={{
                        width: '100%', padding: '6px 8px', borderRadius: '4px',
                        border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)', fontSize: '0.8em', cursor: 'pointer'
                    }}>
                    {BLEND_MODES.map(m => (
                        <option key={m} value={m}>{m === 'source-over' ? 'Normal' : m.replace(/-/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Border / Stroke */}
            <div style={sectionStyle}>
                <div style={labelStyle}>
                    <span style={inputLabelStyle}>Border</span>
                    <span style={valueStyle}>{borderWidth}px</span>
                </div>
                <input type="range" className="range-slider" min="0" max="20" step="1"
                    value={borderWidth} onChange={e => handleBorderWidth(parseInt(e.target.value))} />
                {borderWidth > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={inputLabelStyle}>Color</span>
                        <input type="color" value={borderColor}
                            onChange={e => handleBorderColor(e.target.value)}
                            style={{ width: '24px', height: '20px', border: 'none', cursor: 'pointer', background: 'none' }} />
                    </div>
                )}
            </div>

            {/* Rounded Corners (rect only) */}
            {isRect && (
                <div style={sectionStyle}>
                    <div style={labelStyle}>
                        <span style={inputLabelStyle}>Corner Radius</span>
                        <span style={valueStyle}>{cornerRadius}px</span>
                    </div>
                    <input type="range" className="range-slider" min="0" max="100" step="1"
                        value={cornerRadius} onChange={e => handleCornerRadius(parseInt(e.target.value))} />
                </div>
            )}
        </div>
    );
}
