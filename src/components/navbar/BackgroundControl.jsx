import { useState, useRef } from 'react';
import { PaintBucket } from 'lucide-react';
import { ColorPicker } from '../ColorPicker';

export function BackgroundControl({ canvasManager }) {
    const [showPicker, setShowPicker] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const buttonRef = useRef(null);



    const handleColorChange = (newColor) => {
        setColor(newColor);
        if (canvasManager) {
            canvasManager.setBackgroundColor(newColor);
        }
    };

    return (
        <div className="nav-action-group">
            <button
                ref={buttonRef}
                className={`icon-btn ${showPicker ? 'active' : ''}`}
                onClick={() => setShowPicker(!showPicker)}
                title="Canvas Background Color"
            >
                <PaintBucket size={18} />
            </button>

            {showPicker && (
                <ColorPicker
                    color={color}
                    onChange={handleColorChange}
                    onClose={() => setShowPicker(false)}
                    anchorEl={buttonRef.current}
                    align="right"
                />
            )}
        </div>
    );
}
