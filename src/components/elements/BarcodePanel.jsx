import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { useCanvas } from '../../context/CanvasContext';

export function BarcodePanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const [barcodeText, setBarcodeText] = useState('');
    const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
    const [barcodeLineColor, setBarcodeLineColor] = useState('#000000');
    const [barcodeShowText, setBarcodeShowText] = useState(true);

    const handleAddBarcode = async () => {
        if (!canvasManager || !barcodeText.trim()) return;
        try {
            const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            JsBarcode(svgNode, barcodeText, {
                format: barcodeFormat,
                lineColor: barcodeLineColor,
                displayValue: barcodeShowText,
                background: '#ffffff00', // Transparent
                margin: 0
            });
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgNode);
            await canvasManager.addSVGString(svgString, { scaleX: 1, scaleY: 1 });
        } catch (err) {
            console.error("Barcode generation failed:", err);
            alert("Failed to generate Barcode. Check format or value.");
        }
    };

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Barcode Generator</span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label className="input-label">Value</label>
                    <input
                        type="text"
                        className="panel-input"
                        placeholder="12345678"
                        value={barcodeText}
                        onChange={(e) => setBarcodeText(e.target.value)}
                    />
                </div>

                <div>
                    <label className="input-label">Format</label>
                    <select
                        className="panel-select"
                        value={barcodeFormat}
                        onChange={(e) => setBarcodeFormat(e.target.value)}
                    >
                        <option value="CODE128">CODE128 (Standard)</option>
                        <option value="EAN13">EAN13 (Product)</option>
                        <option value="UPC">UPC (US Retail)</option>
                        <option value="ITF">ITF</option>
                        <option value="MSI">MSI</option>
                        <option value="codabar">Codabar</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <label className="input-label" style={{ marginBottom: 0 }}>Color</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                            <input
                                type="color"
                                value={barcodeLineColor}
                                onChange={(e) => setBarcodeLineColor(e.target.value)}
                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={barcodeShowText}
                            onChange={(e) => setBarcodeShowText(e.target.checked)}
                            id="showTextCheck"
                        />
                        <label htmlFor="showTextCheck" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Show Numbers</label>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddBarcode}
                    disabled={!barcodeText.trim()}
                    style={{ marginTop: '10px' }}
                >
                    Generate Barcode
                </button>
            </div>
        </div>
    );
}
