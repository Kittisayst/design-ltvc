import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

export function ColorPicker({ color, onChange, onClose, anchorEl, align = 'left' }) {
    const pickerRef = useRef(null);
    const [position, setPosition] = useState({ top: 100, left: 100, right: 0 });
    const [inputValue, setInputValue] = useState(color);

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 10,
                left: rect.left,
                right: window.innerWidth - rect.right
            });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target) && !anchorEl?.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    // Sync input with prop change (unless user is typing, implicit via focus check? or just on prop update)
    useEffect(() => {
        if (color === 'transparent') {
            setInputValue('');
        } else {
            setInputValue(color.toUpperCase());
        }
    }, [color]);

    const handleHexChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Validate Hex
        if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
            onChange(val);
        } else if (/^([0-9A-F]{3}){1,2}$/i.test(val)) {
            onChange('#' + val);
        }
    };

    const isTransparent = color === 'transparent';

    return (
        <div
            ref={pickerRef}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: align === 'left' ? `${position.left}px` : 'auto',
                right: align === 'right' ? `${position.right}px` : 'auto',
                zIndex: 99999,
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                border: '1px solid #e5e5e5',
                width: '200px'
            }}
        >
            <HexColorPicker
                color={isTransparent ? '#FFFFFF' : color}
                onChange={onChange}
                style={{ width: '100%', height: '150px' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {/* Hex Input */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f3f4f6',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    padding: '0 8px'
                }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px', marginRight: '4px' }}>#</span>
                    <input
                        type="text"
                        value={isTransparent ? 'TRANSPARENT' : inputValue.replace('#', '')}
                        onChange={handleHexChange}
                        placeholder="HEX"
                        style={{
                            border: 'none',
                            background: 'transparent',
                            width: '100%',
                            padding: '6px 0',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none',
                            color: '#374151',
                            textTransform: 'uppercase'
                        }}
                    />
                </div>

                {/* Transparent Button */}
                <button
                    onClick={() => onChange('transparent')}
                    title="No Color"
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: `1px solid ${isTransparent ? '#6366f1' : '#e5e5e5'}`,
                        background: 'conic-gradient(from 180deg at 50% 50%, #fff 0deg, #fff 90deg, #e5e5e5 90deg, #e5e5e5 180deg, #fff 180deg, #fff 270deg, #e5e5e5 270deg, #e5e5e5 360deg)',
                        backgroundSize: '10px 10px',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        position: 'relative',
                        flexShrink: 0
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '120%',
                        height: '2px',
                        background: '#ef4444',
                        transform: 'translate(-50%, -50%) rotate(-45deg)'
                    }} />
                </button>
            </div>
        </div>
    );
}
