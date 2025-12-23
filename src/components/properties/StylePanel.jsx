import { useStore } from '../../store/useStore';
import { useCanvas } from '../../context/CanvasContext';

export function StylePanel({ activeObject, onUpdate }) {
    const {
        setColorPickerVisible,
        setColorPickerAnchor,
        setActiveColorProp,
        setColorPickerAlign
    } = useStore();

    if (!activeObject) return null;

    // Helper to open color picker
    const openColorPicker = (e, prop, align = 'left') => {
        setActiveColorProp(prop);
        setColorPickerAnchor(e.currentTarget);
        setColorPickerAlign(align);
        setColorPickerVisible(true);
    };

    const fill = activeObject.fill;
    const stroke = activeObject.stroke;
    const strokeWidth = activeObject.strokeWidth || 0;

    // Dash Array logic
    const dashArray = activeObject.strokeDashArray;
    let dashType = 'solid';
    if (dashArray && dashArray.length > 0) {
        if (dashArray[0] < 5) dashType = 'dotted'; // [2, 2]
        else dashType = 'dashed'; // [10, 5]
    }

    const handleDashChange = (type) => {
        let val = null;
        if (type === 'dashed') val = [10, 5];
        if (type === 'dotted') val = [2, 2];
        onUpdate('strokeDashArray', val);
    };

    // Shadow logic
    const shadow = activeObject.shadow || {};
    const shadowColor = shadow.color || '#000000';
    const shadowBlur = shadow.blur || 0;
    const shadowOffsetX = shadow.offsetX || 0;
    const shadowOffsetY = shadow.offsetY || 0;

    const updateShadow = (prop, val) => {
        // We need to construct the shadow object or update prop path 'shadow.X'
        // PropertyPanel used 'shadow.blur'. CanvasManager handles 'shadow.' usage.
        onUpdate(`shadow.${prop}`, val);
    };

    return (
        <div className="section">
            <div className="section-title">Appearance</div>

            {/* Fill & Stroke Colors */}
            <div className="inputs-grid-2">
                <div className="input-group">
                    <label className="input-label">Fill</label>
                    <div
                        className="color-swatch-btn"
                        style={{
                            backgroundColor: typeof fill === 'string' ? fill : 'transparent',
                            backgroundImage: typeof fill !== 'string' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                        }}
                        onClick={(e) => openColorPicker(e, 'fill', 'right')}
                    >
                        {typeof fill !== 'string' && <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.1))' }}></div>}
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Stroke</label>
                    <div
                        className="color-swatch-btn"
                        style={{
                            backgroundColor: typeof stroke === 'string' ? stroke : 'transparent',
                        }}
                        onClick={(e) => openColorPicker(e, 'stroke', 'right')}
                    />
                </div>
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Stroke Width</label>
                    <span className="value-display">{strokeWidth}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="50"
                    value={strokeWidth}
                    onChange={(e) => onUpdate('strokeWidth', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <label className="input-label">Stroke Style</label>
                <select
                    className="select-field"
                    value={dashType}
                    onChange={(e) => handleDashChange(e.target.value)}
                >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                </select>
            </div>

            <div className="section-divider my-2"></div>
            <div className="section-title">Shadow</div>

            <div className="input-group">
                <label className="input-label">Shadow Color</label>
                <div
                    className="color-swatch-btn"
                    style={{
                        backgroundColor: shadowColor,
                    }}
                    onClick={(e) => openColorPicker(e, 'shadow.color', 'right')}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Blur</label>
                    <span className="value-display">{shadowBlur}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="50"
                    value={shadowBlur}
                    onChange={(e) => updateShadow('blur', parseInt(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">X Offset</label>
                    <span className="value-display">{shadowOffsetX}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-50"
                    max="50"
                    value={shadowOffsetX}
                    onChange={(e) => updateShadow('offsetX', parseInt(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label">Y Offset</label>
                    <span className="value-display">{shadowOffsetY}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-50"
                    max="50"
                    value={shadowOffsetY}
                    onChange={(e) => updateShadow('offsetY', parseInt(e.target.value))}
                />
            </div>

        </div>
    );
}
