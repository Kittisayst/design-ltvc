import React from 'react';
import { useStore } from '../../store/useStore';
import { useCanvas } from '../../context/CanvasContext';
import { Crop, Layers, Wand2, Sparkles, ScanText } from 'lucide-react';
import BackgroundRemovalService from '../../services/BackgroundRemovalService';
import { NotificationManager } from '../../core/NotificationManager';

export function ImageEffectsPanel({ activeObject, canvasManager, onUpdate }) {
    const {
        setColorPickerVisible,
        setColorPickerAnchor,
        setActiveColorProp
    } = useStore();

    if (!activeObject || (activeObject.type !== 'image' && activeObject.type !== 'fabric-image')) return null;

    const openColorPicker = (e, prop) => {
        setActiveColorProp(prop);
        setColorPickerAnchor(e.currentTarget);
        setColorPickerVisible(true);
    };

    const getFilterValue = (type) => {
        if (!activeObject.filters) return 0;

        const filterMap = {
            'brightness': 'Brightness',
            'contrast': 'Contrast',
            'blur': 'Blur',
            'saturation': 'Saturation',
            'grayscale': 'Grayscale',
            'sepia': 'Sepia',
            'hue': 'HueRotation',
            'noise': 'Noise',
            'pixelate': 'Pixelate',
            'tint': 'BlendColor'
        };

        const targetType = filterMap[type];
        const filter = activeObject.filters.find(f => f.type === targetType);

        if (!filter) return 0;

        if (type === 'blur') return filter.blur || 0;
        if (type === 'pixelate') return filter.blocksize || 0;
        if (type === 'hue') return filter.rotation || 0;
        if (type === 'noise') return filter.noise || 0;

        if (type === 'sharpen') {
            if (!filter.matrix) return 0;
            const center = filter.matrix[4];
            const val = (center - 1) / 4;
            return val;
        }

        return filter[type] || 0;
    };

    const tint = activeObject.fill;

    const [isCropping, setIsCropping] = React.useState(false);
    const [isRemovingBackground, setIsRemovingBackground] = React.useState(false);
    const [isUpscaling, setIsUpscaling] = React.useState(false);
    const [isExtractingText, setIsExtractingText] = React.useState(false);
    const [sharpenLevel, setSharpenLevel] = React.useState(0);
    const { extractedPalette, setExtractedPalette } = useStore();

    React.useEffect(() => {
        const currentVal = getFilterValue('sharpen');
        if (Math.abs(currentVal - sharpenLevel) > 0.01) {
            setSharpenLevel(currentVal);
        }
    }, [activeObject]);

    const handleRemoveBackground = async () => {
        if (!activeObject) return;
        setIsRemovingBackground(true);
        NotificationManager.info("Removing background. This may take a moment...", 3000);
        try {
            const src = activeObject.getSrc();
            NotificationManager.info("Downloading AI models. Check Console for progress...", 5000);
            const blob = await BackgroundRemovalService.removeBackground(src);
            const newUrl = URL.createObjectURL(blob);
            await canvasManager.replaceImage(activeObject, newUrl);
            NotificationManager.success("Background removed!");
        } catch (error) {
            console.error("Background removal failed:", error);
            NotificationManager.error("Failed to remove background.");
        } finally {
            setIsRemovingBackground(false);
        }
    };

    const handleExtractText = async () => {
        setIsExtractingText(true);
        try {
            await canvasManager.extractTextFromActiveImage();
        } finally {
            setIsExtractingText(false);
        }
    };

    const handleExtractPalette = async () => {
        if (!canvasManager) return;
        const result = await canvasManager.extractPaletteFromActiveImage();
        if (result) {
            setExtractedPalette(result);
        }
    };

    const handleUpscale = async () => {
        setIsUpscaling(true);
        try {
            await canvasManager.upscaleActiveImage();
        } finally {
            setIsUpscaling(false);
        }
    };

    const handleSharpenUpdate = (val) => {
        setSharpenLevel(val);
        onUpdate('filter.sharpen', val);
    };

    React.useEffect(() => {
        if (!canvasManager) return;
        setIsCropping(!!canvasManager.isCropping);
        const originalCallback = canvasManager.onCropModeChange;
        canvasManager.onCropModeChange = (isActive) => {
            setIsCropping(isActive);
            if (originalCallback) originalCallback(isActive);
        };
        return () => {
            canvasManager.onCropModeChange = originalCallback;
        };
    }, [canvasManager, activeObject]);

    return (
        <div className="section">
            <div className="section-title">Image Correction</div>

            <button
                className={`btn-secondary full-width mb-2 ${isCropping ? 'active' : ''}`}
                onClick={() => isCropping ? canvasManager.cancelCrop() : canvasManager.startCropMode()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isCropping ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 0',
                    color: isCropping ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                }}
            >
                <Crop size={16} />
                <span>{isCropping ? 'Done Cropping' : 'Crop Image'}</span>
            </button>

            <button
                className="btn-primary full-width mb-2"
                onClick={handleRemoveBackground}
                disabled={isRemovingBackground}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 0',
                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1)',
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                }}
            >
                {isRemovingBackground ? (
                    <div className="spinner-small" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                    <>
                        <Wand2 size={16} color="#fff" />
                        <span>Remove BG</span>
                    </>
                )}
            </button>

            <button
                className="btn-secondary full-width mb-2"
                onClick={() => canvasManager.vectorizeActiveImage()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 0',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                }}
            >
                <Layers size={16} />
                <span>Vectorize</span>
            </button>

            <button
                className="btn-secondary full-width mb-2"
                onClick={handleUpscale}
                disabled={isUpscaling}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s ease',
                    fontWeight: 500
                }}
            >
                {isUpscaling ? (
                    <div className="spinner-small" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                    <>
                        <Sparkles size={16} className="text-accent" style={{ color: '#fbbf24' }} />
                        <span>AI Upscale (x2)</span>
                    </>
                )}
            </button>

            <button
                className="btn-secondary full-width mb-3"
                onClick={handleExtractPalette}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 0',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                }}
            >
                <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span>Extract Color Palette</span>
            </button>

            <button
                className="btn-secondary full-width mb-3"
                onClick={handleExtractText}
                disabled={isExtractingText}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 0',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                }}
            >
                {isExtractingText ? (
                    <div className="spinner-small" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                    <>
                        <ScanText size={16} />
                        <span>Extract Text (OCR)</span>
                    </>
                )}
            </button>

            <div className="input-group mb-3">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Sharpen (Clear)</label>
                    <span className="value-display" style={{ opacity: 0.6 }}>
                        {sharpenLevel > 0 ? `${Math.round(sharpenLevel * 200)}%` : 'Off'}
                    </span>
                </div>
                <div style={{ display: 'flex', width: '100%', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                    {[
                        { label: 'Off', val: 0 },
                        { label: '1x', val: 0.1 },
                        { label: '2x', val: 0.2 },
                        { label: '3x', val: 0.35 },
                        { label: '4x', val: 0.5 }
                    ].map((btn, index, arr) => {
                        const isActive = Math.abs(sharpenLevel - btn.val) < 0.01;
                        return (
                            <button
                                key={btn.label}
                                onClick={() => handleSharpenUpdate(btn.val)}
                                title={btn.label}
                                style={{
                                    flex: 1,
                                    padding: '6px 0',
                                    fontSize: '0.8em',
                                    backgroundColor: isActive ? 'var(--primary-color, #007bff)' : '#2a2a2a',
                                    color: isActive ? '#fff' : '#888',
                                    border: 'none',
                                    borderRight: index < arr.length - 1 ? '1px solid #333' : 'none',
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Tint</label>
                <div
                    className="color-swatch-btn"
                    style={{ backgroundColor: typeof tint === 'string' ? tint : 'transparent' }}
                    onClick={(e) => openColorPicker(e, 'fill')}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Brightness</label>
                    <span className="value-display">{Math.round(getFilterValue('brightness') * 100) / 100}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={getFilterValue('brightness')}
                    onChange={(e) => onUpdate('filter.brightness', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Contrast</label>
                    <span className="value-display">{Math.round(getFilterValue('contrast') * 100) / 100}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={getFilterValue('contrast')}
                    onChange={(e) => onUpdate('filter.contrast', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Blur</label>
                    <span className="value-display">{Math.round(getFilterValue('blur') * 100) / 100}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={getFilterValue('blur')}
                    onChange={(e) => onUpdate('filter.blur', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Saturation</label>
                    <span className="value-display">{Math.round(getFilterValue('saturation') * 100) / 100}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={getFilterValue('saturation')}
                    onChange={(e) => onUpdate('filter.saturation', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Hue</label>
                    <span className="value-display">{Math.round(getFilterValue('hue'))}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={getFilterValue('hue')}
                    onChange={(e) => onUpdate('filter.hue', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Noise</label>
                    <span className="value-display">{getFilterValue('noise')}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="100"
                    step="5"
                    value={getFilterValue('noise')}
                    onChange={(e) => onUpdate('filter.noise', parseInt(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Pixelate</label>
                    <span className="value-display">{getFilterValue('pixelate')}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="20"
                    step="1"
                    value={getFilterValue('pixelate')}
                    onChange={(e) => onUpdate('filter.pixelate', parseInt(e.target.value))}
                />
            </div>
        </div >
    );
}
