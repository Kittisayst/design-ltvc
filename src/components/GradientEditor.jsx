import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Plus, Trash2, RotateCw } from 'lucide-react';

const PRESETS = [
    { name: 'Sunset', stops: [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: '#feca57' }] },
    { name: 'Ocean', stops: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }] },
    { name: 'Forest', stops: [{ offset: 0, color: '#11998e' }, { offset: 1, color: '#38ef7d' }] },
    { name: 'Night', stops: [{ offset: 0, color: '#0f0c29' }, { offset: 0.5, color: '#302b63' }, { offset: 1, color: '#24243e' }] },
    { name: 'Fire', stops: [{ offset: 0, color: '#f12711' }, { offset: 1, color: '#f5af19' }] },
    { name: 'Sky', stops: [{ offset: 0, color: '#a1c4fd' }, { offset: 1, color: '#c2e9fb' }] },
];

export function GradientEditor({ onApply, onClose, target = 'background' }) {
    const [gradientType, setGradientType] = useState('linear');
    const [angle, setAngle] = useState(90);
    const [colorStops, setColorStops] = useState([
        { offset: 0, color: '#6366f1' },
        { offset: 1, color: '#a855f7' }
    ]);
    const [selectedStop, setSelectedStop] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const barRef = useRef(null);

    const getPreviewCSS = useCallback(() => {
        const sorted = [...colorStops].sort((a, b) => a.offset - b.offset);
        const stopsStr = sorted.map(s => `${s.color} ${Math.round(s.offset * 100)}%`).join(', ');
        if (gradientType === 'radial') {
            return `radial-gradient(circle, ${stopsStr})`;
        }
        return `linear-gradient(${angle}deg, ${stopsStr})`;
    }, [colorStops, gradientType, angle]);

    const handleApply = () => {
        onApply({
            type: gradientType,
            angle,
            colorStops: [...colorStops].sort((a, b) => a.offset - b.offset),
            target
        });
    };

    const addStop = () => {
        if (colorStops.length >= 8) return;
        const newOffset = 0.5;
        setColorStops([...colorStops, { offset: newOffset, color: '#ffffff' }]);
        setSelectedStop(colorStops.length);
    };

    const removeStop = (idx) => {
        if (colorStops.length <= 2) return;
        const next = colorStops.filter((_, i) => i !== idx);
        setColorStops(next);
        setSelectedStop(Math.min(selectedStop, next.length - 1));
    };

    const updateStopColor = (color) => {
        const next = [...colorStops];
        next[selectedStop] = { ...next[selectedStop], color };
        setColorStops(next);
    };

    const handleBarClick = (e) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        // Find closest stop
        let closest = 0;
        let minDist = Infinity;
        colorStops.forEach((s, i) => {
            const d = Math.abs(s.offset - x);
            if (d < minDist) { minDist = d; closest = i; }
        });
        setSelectedStop(closest);
    };

    const handleStopDrag = (idx, e) => {
        e.preventDefault();
        const bar = barRef.current;
        if (!bar) return;

        const onMove = (me) => {
            const rect = bar.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
            const next = [...colorStops];
            next[idx] = { ...next[idx], offset: Math.round(x * 100) / 100 };
            setColorStops(next);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const applyPreset = (preset) => {
        setColorStops(preset.stops.map(s => ({ ...s })));
        setSelectedStop(0);
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '14px',
            width: '260px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            color: 'var(--text-primary)',
            fontSize: '12px'
        }}>
            {/* Preview */}
            <div style={{
                height: '48px',
                borderRadius: '6px',
                background: getPreviewCSS(),
                border: '1px solid var(--border-color)'
            }} />

            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {['linear', 'radial'].map(t => (
                    <button key={t} onClick={() => setGradientType(t)} style={{
                        flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)',
                        background: gradientType === t ? 'var(--primary-color)' : 'var(--bg-tertiary)',
                        color: gradientType === t ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '11px', textTransform: 'capitalize'
                    }}>{t}</button>
                ))}
            </div>

            {/* Angle (linear only) */}
            {gradientType === 'linear' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCw size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <input type="range" min="0" max="360" value={angle}
                        onChange={e => setAngle(Number(e.target.value))}
                        style={{ flex: 1 }} />
                    <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-secondary)' }}>{angle}°</span>
                </div>
            )}

            {/* Color Stop Bar */}
            <div style={{ position: 'relative', height: '24px', cursor: 'pointer' }}
                ref={barRef} onClick={handleBarClick}>
                <div style={{
                    position: 'absolute', top: '6px', left: 0, right: 0, height: '12px',
                    borderRadius: '6px', background: getPreviewCSS(),
                    border: '1px solid var(--border-color)'
                }} />
                {colorStops.map((stop, i) => (
                    <div key={i}
                        onMouseDown={(e) => { setSelectedStop(i); handleStopDrag(i, e); }}
                        style={{
                            position: 'absolute', top: '2px',
                            left: `calc(${stop.offset * 100}% - 8px)`,
                            width: '16px', height: '20px',
                            borderRadius: '3px',
                            background: stop.color,
                            border: selectedStop === i ? '2px solid var(--primary-color)' : '2px solid #fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            cursor: 'grab', zIndex: selectedStop === i ? 2 : 1
                        }} />
                ))}
            </div>

            {/* Stop Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                    onClick={() => setShowPicker(!showPicker)}
                    style={{
                        width: '24px', height: '24px', borderRadius: '4px',
                        background: colorStops[selectedStop]?.color || '#000',
                        border: '1px solid var(--border-color)', cursor: 'pointer', flexShrink: 0
                    }} />
                <input type="text" value={colorStops[selectedStop]?.color || ''}
                    onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateStopColor(v);
                    }}
                    style={{
                        flex: 1, padding: '4px 6px', borderRadius: '4px',
                        border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'monospace'
                    }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {Math.round((colorStops[selectedStop]?.offset || 0) * 100)}%
                </span>
                <button onClick={addStop} title="Add Stop" style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px'
                }}><Plus size={14} /></button>
                <button onClick={() => removeStop(selectedStop)} title="Remove Stop"
                    disabled={colorStops.length <= 2}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                        color: colorStops.length <= 2 ? 'var(--bg-hover)' : '#ef4444'
                    }}><Trash2 size={14} /></button>
            </div>

            {/* Inline Color Picker */}
            {showPicker && (
                <HexColorPicker
                    color={colorStops[selectedStop]?.color || '#000'}
                    onChange={updateStopColor}
                    style={{ width: '100%', height: '120px' }}
                />
            )}

            {/* Presets */}
            <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}>Presets</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {PRESETS.map((p, i) => (
                        <div key={i} onClick={() => applyPreset(p)} title={p.name} style={{
                            height: '24px', borderRadius: '4px', cursor: 'pointer',
                            border: '1px solid var(--border-color)',
                            background: `linear-gradient(90deg, ${p.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
                        }} />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleApply} style={{
                    flex: 1, padding: '6px', borderRadius: '4px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontSize: '12px'
                }}>Apply</button>
                <button onClick={onClose} style={{
                    flex: 1, padding: '6px', borderRadius: '4px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px'
                }}>Cancel</button>
            </div>
        </div>
    );
}
