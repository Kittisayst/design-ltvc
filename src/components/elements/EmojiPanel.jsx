import React from 'react';
import { ArrowLeft } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useCanvas } from '../../context/CanvasContext';

export function EmojiPanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const handleEmojiClick = (emojiData) => {
        if (canvasManager) {
            canvasManager.addText(emojiData.emoji, { fontSize: 72 });
        }
    };

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Emoji Picker</span>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    width="100%"
                    height="100%"
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    previewConfig={{ showPreview: false }}
                />
            </div>
        </div>
    );
}
