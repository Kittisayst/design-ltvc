import { useState, useRef, useEffect } from 'react';
import { PaintBucket, Palette } from 'lucide-react';
import { ColorPicker } from '../ColorPicker';
import { GradientEditor } from '../GradientEditor';
import { useCanvas } from '../../context/CanvasContext';

export function BackgroundControl() {
    const { canvasManager } = useCanvas();
    const [mode, setMode] = useState(null); // null | 'color' | 'gradient'
    const [color, setColor] = useState('#ffffff');
    const colorBtnRef = useRef(null);
    const gradBtnRef = useRef(null);
    const gradPanelRef = useRef(null);

    // Close gradient panel on outside click
    useEffect(() => {
        if (mode !== 'gradient') return;
        const handler = (e) => {
            if (gradPanelRef.current && !gradPanelRef.current.contains(e.target) &&
                !gradBtnRef.current?.contains(e.target)) {
                setMode(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mode]);

    const handleColorChange = (newColor) => {
        setColor(newColor);
        if (canvasManager) {
            canvasManager.setBackgroundColor(newColor);
        }
    };

    const handleGradientApply = (config) => {
        if (canvasManager) {
            canvasManager.setAdvancedGradient({ ...config, target: 'background' });
        }
        setMode(null);
    };

    return (
        <div className="nav-action-group" style={{ position: 'relative' }}>
            <button
                ref={colorBtnRef}
                className={`icon-btn ${mode === 'color' ? 'active' : ''}`}
                onClick={() => setMode(mode === 'color' ? null : 'color')}
                title="Canvas Background Color"
            >
                <PaintBucket size={18} />
            </button>
            <button
                ref={gradBtnRef}
                className={`icon-btn ${mode === 'gradient' ? 'active' : ''}`}
                onClick={() => setMode(mode === 'gradient' ? null : 'gradient')}
                title="Canvas Background Gradient"
            >
                <Palette size={18} />
            </button>

            {mode === 'color' && (
                <ColorPicker
                    color={color}
                    onChange={handleColorChange}
                    onClose={() => setMode(null)}
                    anchorEl={colorBtnRef.current}
                    align="right"
                />
            )}

            {mode === 'gradient' && (
                <div ref={gradPanelRef} style={{
                    position: 'fixed',
                    top: gradBtnRef.current ? gradBtnRef.current.getBoundingClientRect().bottom + 10 : 60,
                    right: gradBtnRef.current ? window.innerWidth - gradBtnRef.current.getBoundingClientRect().right : 20,
                    zIndex: 99999
                }}>
                    <GradientEditor
                        onApply={handleGradientApply}
                        onClose={() => setMode(null)}
                        target="background"
                    />
                </div>
            )}
        </div>
    );
}
