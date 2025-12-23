import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';

export function TextPanel({ activeObject, canvasManager, onUpdate }) {
    if (!activeObject || !['i-text', 'text'].includes(activeObject.type)) return null;

    const fonts = [
        { label: 'Arial (Standard)', value: 'Arial' },
        { label: 'Times New Roman', value: 'Times New Roman' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Noto Sans Lao', value: 'Noto Sans Lao' },
        { label: 'Noto Serif Lao', value: 'Noto Serif Lao' },
        { label: 'Phetsarath OT', value: 'Phetsarath OT' },
        { label: 'Noto Sans Lao Looped', value: 'Noto Sans Lao Looped' },
        { label: 'Roboto', value: 'Roboto' },
        { label: 'Open Sans', value: 'Open Sans' },
        { label: 'Montserrat', value: 'Montserrat' },
        { label: 'Poppins', value: 'Poppins' },
        { label: 'Lato', value: 'Lato' },
        { label: 'Oswald', value: 'Oswald' },
        { label: 'Playfair Display', value: 'Playfair Display' },
        { label: 'Raleway', value: 'Raleway' },
        { label: 'Impact', value: 'Impact' }
    ];

    const handleFontChange = (e) => {
        const val = e.target.value;
        // Use setTextStyle to ensure font load
        if (canvasManager?.setTextStyle) {
            canvasManager.setTextStyle('fontFamily', val);
        } else {
            onUpdate('fontFamily', val);
        }
    };

    const toggleStyle = (style) => {
        if (canvasManager?.toggleTextDecoration) {
            canvasManager.toggleTextDecoration(style);
        }
    };

    const textAlign = activeObject.textAlign || 'left';
    const fontWeight = activeObject.fontWeight || 'normal';
    const fontStyle = activeObject.fontStyle || 'normal';
    const underline = !!activeObject.underline;

    return (
        <div className="section">
            <div className="section-title">Text Style</div>

            <div className="input-group">
                <label className="input-label">Font</label>
                <select
                    className="select-field"
                    value={activeObject.fontFamily || 'Arial'}
                    onChange={handleFontChange}
                >
                    {fonts.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            <div className="property-actions wide mt-2">
                <button
                    className={`icon-btn ${textAlign === 'left' ? 'active' : ''}`}
                    onClick={() => onUpdate('textAlign', 'left')}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    className={`icon-btn ${textAlign === 'center' ? 'active' : ''}`}
                    onClick={() => onUpdate('textAlign', 'center')}
                    title="Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    className={`icon-btn ${textAlign === 'right' ? 'active' : ''}`}
                    onClick={() => onUpdate('textAlign', 'right')}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    className={`icon-btn ${textAlign === 'justify' ? 'active' : ''}`}
                    onClick={() => onUpdate('textAlign', 'justify')}
                    title="Justify"
                >
                    <AlignJustify size={16} />
                </button>
            </div>

            <div className="property-actions wide mt-2">
                <button
                    className={`icon-btn ${fontWeight === 'bold' ? 'active' : ''}`}
                    onClick={() => toggleStyle('fontWeight')}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    className={`icon-btn ${fontStyle === 'italic' ? 'active' : ''}`}
                    onClick={() => toggleStyle('fontStyle')}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    className={`icon-btn ${underline ? 'active' : ''}`}
                    onClick={() => toggleStyle('underline')}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
            </div>

            <div className="input-group mt-2">
                <div className="label-row">
                    <label className="input-label">Line Height</label>
                    <span className="value-display">{Math.round((activeObject.lineHeight || 1.16) * 10) / 10}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={activeObject.lineHeight || 1.16}
                    onChange={(e) => onUpdate('lineHeight', parseFloat(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row">
                    <label className="input-label">Char Spacing</label>
                    <span className="value-display">{activeObject.charSpacing || 0}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="-50"
                    max="200"
                    step="10"
                    value={activeObject.charSpacing || 0}
                    onChange={(e) => onUpdate('charSpacing', parseInt(e.target.value))}
                />
            </div>

            <div className="input-group mt-2">
                <div className="label-row">
                    <label className="input-label">Stroke Width</label>
                    <span className="value-display">{activeObject.strokeWidth || 0}</span>
                </div>
                <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="20"
                    step="0.5"
                    value={activeObject.strokeWidth || 0}
                    onChange={(e) => onUpdate('strokeWidth', parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
}
