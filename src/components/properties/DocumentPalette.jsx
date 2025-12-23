import React from 'react';
import { useStore } from '../../store/useStore';
import { Trash2 } from 'lucide-react';
import { NotificationManager } from '../../core/NotificationManager';

export function DocumentPalette({ onUpdate }) {
    const { extractedPalette, setExtractedPalette } = useStore();

    if (!extractedPalette) return null;

    const colors = [extractedPalette.dominant, ...extractedPalette.palette];

    const applyColor = (color) => {
        onUpdate('fill', color);
        NotificationManager.info(`Color ${color} applied!`);
    };

    return (
        <div className="section document-palette">
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Document Palette</span>
                <button
                    className="ft-btn"
                    onClick={() => setExtractedPalette(null)}
                    title="Clear Palette"
                    style={{ padding: '2px', height: 'auto' }}
                >
                    <Trash2 size={12} />
                </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {colors.map((color, i) => (
                    <div
                        key={`${color}-${i}`}
                        className="color-swatch-btn"
                        style={{
                            backgroundColor: color,
                            width: '28px',
                            height: '28px',
                            border: color.toLowerCase() === '#ffffff' ? '1px solid var(--border-color)' : 'none',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease'
                        }}
                        onClick={() => applyColor(color)}
                        title={`Apply ${color}`}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                ))}
            </div>
        </div>
    );
}
