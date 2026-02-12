import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';
import { useCanvas } from '../../context/CanvasContext';

export function QRCodePanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const [qrText, setQrText] = useState('');
    const [qrColor, setQrColor] = useState('#000000');

    const handleAddQrCode = async () => {
        if (!canvasManager || !qrText.trim()) return;
        try {
            const svgString = await QRCode.toString(qrText, {
                type: 'svg',
                color: {
                    dark: qrColor,
                    light: '#00000000' // Transparent background
                },
                margin: 1
            });
            await canvasManager.addSVGString(svgString, { scaleX: 1, scaleY: 1 });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>QR Code Generator</span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label className="input-label">Content / URL</label>
                    <input
                        type="text"
                        className="panel-input"
                        placeholder="https://example.com"
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                    />
                </div>

                <div>
                    <label className="input-label">Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{qrColor}</span>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddQrCode}
                    disabled={!qrText.trim()}
                    style={{ marginTop: '10px' }}
                >
                    Generate QR Code
                </button>

                <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.8rem', color: '#888', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> The QR Code is generated as a <b>Vector (SVG)</b> object. You can scale it infinitely without losing quality!
                </div>
            </div>
        </div>
    );
}
