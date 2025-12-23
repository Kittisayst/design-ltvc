import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Copy, Trash2, ArrowUp, ArrowDown, Layers, LayoutGrid, Check, X, Wand2, Crop, Palette, Shapes, Sparkles } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { useStore } from '../store/useStore';
import BackgroundRemovalService from '../services/BackgroundRemovalService';
import { NotificationManager } from '../core/NotificationManager';

export function FloatingToolbar() {
    const { canvasManager } = useCanvas();
    const { setColorPickerVisible, setColorPickerAnchor, setExtractedPalette } = useStore();
    const colorSwatchRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeObject, setActiveObject] = useState(null);
    const [isProcessingBg, setIsProcessingBg] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);

    useEffect(() => {
        if (!canvasManager) return;
        // ... (lines 16-62 unchanged)
        const updateToolbar = () => {
            const active = canvasManager.getActiveObject();
            setActiveObject(active);

            if (active) {
                // Calculate position
                const bound = active.getBoundingRect(true, true);
                const canvasEl = canvasManager.canvas.getElement();
                const canvasRect = canvasEl.getBoundingClientRect();

                const objectLeft = canvasRect.left + bound.left;
                const objectTop = canvasRect.top + bound.top;
                const tbWidth = 180;
                const tbHeight = 44;

                const left = objectLeft + (bound.width / 2) - (tbWidth / 2);
                let top = objectTop - tbHeight - 10;
                if (top < 0) top = objectTop + bound.height + 10;

                setPosition({ x: left, y: top });
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        canvasManager.canvas.on('selection:created', updateToolbar);
        canvasManager.canvas.on('selection:updated', updateToolbar);
        canvasManager.canvas.on('selection:cleared', () => setVisible(false));
        canvasManager.canvas.on('object:moving', updateToolbar);
        canvasManager.canvas.on('object:scaling', updateToolbar);
        canvasManager.canvas.on('object:rotating', updateToolbar);
        canvasManager.canvas.on('object:modified', updateToolbar);

        return () => {
            if (canvasManager.canvas) {
                canvasManager.canvas.off('selection:created', updateToolbar);
                canvasManager.canvas.off('selection:updated', updateToolbar);
                canvasManager.canvas.off('selection:cleared');
                canvasManager.canvas.off('object:moving', updateToolbar);
                canvasManager.canvas.off('object:scaling', updateToolbar);
                canvasManager.canvas.off('object:rotating', updateToolbar);
                canvasManager.canvas.off('object:modified', updateToolbar);
            }
        };
    }, [canvasManager]);

    if (!visible || !activeObject) return null;

    const obj = activeObject;
    const isText = obj.type === 'i-text' || obj.type === 'text';
    const isImage = obj.type === 'image' || obj.type === 'fabric-image'; // Check for image
    const isCrop = obj.id === 'crop-ui';
    const isSelection = obj.type === 'activeSelection' || obj.type === 'activeselection';
    const isGroup = obj.type === 'group';


    const handleAction = async (action, data) => {
        if (!canvasManager) return;

        switch (action) {
            case 'duplicate':
                canvasManager.duplicateActiveObject();
                break;
            case 'delete':
                canvasManager.removeActiveObject();
                break;
            case 'layer-up':
                canvasManager.layerActiveObject('up');
                break;
            case 'layer-down':
                canvasManager.layerActiveObject('down');
                break;
            case 'group':
                canvasManager.group();
                break;
            case 'ungroup':
                canvasManager.ungroup();
                break;
            case 'font-family':
                canvasManager.updateActiveObject('fontFamily', data);
                break;
            case 'format':
                if (data === 'bold') canvasManager.toggleTextDecoration('fontWeight');
                if (data === 'italic') canvasManager.toggleTextDecoration('fontStyle');
                if (data === 'underline') canvasManager.toggleTextDecoration('underline');
                break;
            case 'crop-apply':
                canvasManager.applyCrop();
                break;
            case 'crop-cancel':
                canvasManager.cancelCrop();
                break;
            case 'start-crop':
                canvasManager.startCropMode();
                setVisible(false); // Hide toolbar when starting crop
                break;
            case 'toggle-color':
                setColorPickerAnchor(data);
                setColorPickerVisible(prev => !prev);
                break;
            case 'remove-bg':
                if (isProcessingBg) return;
                setIsProcessingBg(true);
                NotificationManager.info("Removing background...", 2000);
                try {
                    const src = activeObject.getSrc();
                    const blob = await BackgroundRemovalService.removeBackground(src);
                    const newUrl = URL.createObjectURL(blob);
                    await canvasManager.replaceImage(activeObject, newUrl);
                    NotificationManager.success("Background removed!");
                } catch (err) {
                    console.error("BG Removal error:", err);
                    NotificationManager.error("Failed to remove background");
                } finally {
                    setIsProcessingBg(false);
                }
                break;
            case 'extract-palette':
                if (!canvasManager) return;
                const result = await canvasManager.extractPaletteFromActiveImage();
                if (result) {
                    setExtractedPalette(result);
                }
                break;
            case 'vectorize':
                setVisible(false); // Hide toolbar as conversion may re-render or change selection
                await canvasManager.vectorizeActiveImage();
                break;
            case 'upscale':
                if (isUpscaling) return;
                setIsUpscaling(true);
                try {
                    await canvasManager.upscaleActiveImage();
                } finally {
                    setIsUpscaling(false);
                }
                break;
        }
    };

    const renderCropControls = () => (
        <>
            <button className="ft-btn" onClick={() => handleAction('crop-apply')} title="Apply" style={{ color: '#4ade80' }}>
                <Check size={16} />
            </button>
            <button className="ft-btn" onClick={() => handleAction('crop-cancel')} title="Cancel" style={{ color: '#f87171' }}>
                <X size={16} />
            </button>
        </>
    );

    const renderTextControls = () => {
        // Helper to extract primary font name from stack (e.g. "'Phetsarath OT', sans-serif" -> "Phetsarath OT")
        const getPrimaryFont = (fontStack) => {
            if (!fontStack) return 'Arial';
            const primary = fontStack.split(',')[0].trim();
            return primary.replace(/['"]/g, ''); // Remove quotes
        };

        return (
            <>
                <select
                    className="ft-select"
                    value={getPrimaryFont(obj.fontFamily) || 'Arial'}
                    onChange={(e) => handleAction('font-family', e.target.value)}
                    title="Font Family"
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Noto Sans Lao">Noto Sans Lao</option>
                    <option value="Noto Serif Lao">Noto Serif Lao</option>
                    <option value="Phetsarath OT">Phetsarath OT</option>
                    <option value="Noto Sans Lao Looped">Noto Sans Lao Looped</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Lato">Lato</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Impact">Impact</option>
                </select>
                <div className="ft-sep"></div>
                <button
                    className={`ft-btn ${obj.fontWeight === 'bold' ? 'active' : ''}`}
                    onClick={() => handleAction('format', 'bold')}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    className={`ft-btn ${obj.fontStyle === 'italic' ? 'active' : ''}`}
                    onClick={() => handleAction('format', 'italic')}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    className={`ft-btn ${obj.underline ? 'active' : ''}`}
                    onClick={() => handleAction('format', 'underline')}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
                <div className="ft-sep"></div>
            </>
        );
    };

    const renderStandardControls = () => (
        <>
            {isText && renderTextControls()}

            {isImage && (
                <>
                    <button
                        className="ft-btn"
                        onClick={() => handleAction('start-crop')}
                        title="Crop Image"
                    >
                        <Crop size={16} />
                    </button>
                    <button
                        className="ft-btn"
                        onClick={() => handleAction('remove-bg')}
                        title="Remove Background"
                        style={{ color: isProcessingBg ? '#8b5cf6' : 'inherit' }}
                    >
                        {isProcessingBg ? (
                            <div className="spinner-small" style={{ border: '2px solid rgba(139, 92, 246, 0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                            <Wand2 size={16} />
                        )}
                    </button>
                    <button
                        className="ft-btn"
                        onClick={() => handleAction('extract-palette')}
                        title="Extract Color Palette"
                    >
                        <Palette size={16} />
                    </button>
                    <button
                        className="ft-btn"
                        onClick={() => handleAction('vectorize')}
                        title="Vectorize Image"
                    >
                        <Shapes size={16} />
                    </button>
                    <button
                        className="ft-btn"
                        onClick={() => handleAction('upscale')}
                        title="AI Quality Enhance"
                        style={{ color: isUpscaling ? 'var(--accent-primary)' : 'inherit' }}
                    >
                        {isUpscaling ? (
                            <div className="spinner-small" style={{ border: '2px solid rgba(139, 92, 246, 0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                            <Sparkles size={16} />
                        )}
                    </button>
                    <div className="ft-sep"></div>
                </>
            )}

            <button className="ft-btn" onClick={() => handleAction('duplicate')} title="Duplicate">
                <Copy size={16} />
            </button>
            <button className="ft-btn" onClick={() => handleAction('delete')} title="Delete">
                <Trash2 size={16} />
            </button>

            <div className="ft-sep"></div>

            <button className="ft-btn" onClick={() => handleAction('layer-up')} title="Bring Forward">
                <ArrowUp size={16} />
            </button>
            <button className="ft-btn" onClick={() => handleAction('layer-down')} title="Send Backward">
                <ArrowDown size={16} />
            </button>

            {isSelection && (
                <>
                    <div className="ft-sep"></div>
                    <button className="ft-btn" onClick={() => handleAction('group')} title="Group">
                        <Layers size={16} />
                    </button>
                </>
            )}

            {isGroup && (
                <>
                    <div className="ft-sep"></div>
                    <button className="ft-btn" onClick={() => handleAction('ungroup')} title="Ungroup">
                        <LayoutGrid size={16} />
                    </button>
                </>
            )}

            <div className="ft-sep"></div>

            <div className="color-swatch-wrap">
                <div
                    ref={colorSwatchRef}
                    className="ft-color-swatch"
                    onClick={() => handleAction('toggle-color', colorSwatchRef.current)}
                    style={{ backgroundColor: obj.fill && typeof obj.fill === 'string' ? obj.fill : 'transparent' }}
                    title="Change Color"
                />
            </div>
        </>
    );

    return (
        <div
            className="floating-toolbar"
            style={{
                position: 'fixed',
                top: `${position.y}px`,
                left: `${position.x}px`,
                zIndex: 1000
            }}
        >
            {isCrop ? renderCropControls() : renderStandardControls()}
        </div>
    );
}
