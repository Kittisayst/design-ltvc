import React, { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import './cropper.css';

export function CropModal({ isOpen, onClose, imageSrc, onCropComplete }) {
    const cropperRef = useRef(null);
    const [loading, setLoading] = useState(true);

    if (!isOpen || !imageSrc) return null;

    const handleCrop = () => {
        const imageElement = cropperRef.current;
        const cropper = imageElement?.cropper;
        if (cropper) {
            // Get crop data (x, y, width, height) relating to the original image size
            const data = cropper.getData(true); // true = rounded
            onCropComplete(data);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="modal-content" style={{
                width: '90%', height: '90%', maxWidth: '1000px', maxHeight: '800px',
                backgroundColor: '#1e1e1e', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'white' }}>Crop Image</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                </div>

                {/* Body - Cropper */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
                    <Cropper
                        src={imageSrc}
                        style={{ height: '100%', width: '100%' }}
                        // Cropper.js options
                        initialAspectRatio={null} // Free crop
                        guides={true}
                        viewMode={1} // Restrict crop box to canvas
                        dragMode="move" // Allow moving image
                        scalable={true}
                        zoomable={true}
                        background={false}
                        autoCropArea={0.8}
                        checkOrientation={false}
                        ref={cropperRef}
                        ready={() => setLoading(false)}
                    />
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', background: '#333', color: 'white', border: 'none' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCrop}
                        className="btn-primary"
                        style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', background: 'var(--accent-color, #007bff)', color: 'white', border: 'none' }}
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
