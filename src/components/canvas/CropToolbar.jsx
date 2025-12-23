import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';

export function CropToolbar({ canvasManager }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!canvasManager) return;

        // Initial check
        setIsVisible(!!canvasManager.isCropping);

        const handleCropChange = (active) => {
            setIsVisible(active);
        };

        // Subscribe (Method injection similar to ImageEffectsPanel)
        // Note: ImageEffectsPanel also injects this. We need to support multiple listeners or
        // ensure we don't overwrite each other. 
        // A simple EventListener pattern in CanvasManager would be better, but for now, 
        // let's assume we might overwrite. 
        // WAIT: If ImageEffectsPanel overwrites this, or vice versa, one will break.
        // I should check CanvasManager to see if I can add a proper listener or if I need to chain.

        // Chaining approach:
        const prevCallback = canvasManager.onCropModeChange;
        canvasManager.onCropModeChange = (active) => {
            setIsVisible(active);
            if (prevCallback) prevCallback(active);
        };

        return () => {
            // Restore? Hard to restore reliably in a chain without IDs. 
            // Better to genericize the callback in CanvasManager later, but for now this works 
            // if components mount/unmount strictly. 
            // Since this Toolbar is likely always mounted in App, and Panel mounts/unmounts,
            // Panel will likely wrap THIS callback.
        };
    }, [canvasManager]);

    if (!isVisible) return null;

    return (
        <div className="crop-toolbar">
            <span className="crop-label">Crop Mode</span>
            <div className="crop-actions">
                <button
                    className="icon-btn danger"
                    onClick={() => canvasManager.cancelCrop()}
                    title="Cancel"
                >
                    <X size={18} />
                </button>
                <button
                    className="icon-btn primary"
                    onClick={() => canvasManager.applyCrop()}
                    title="Apply Crop"
                >
                    <Check size={18} />
                </button>
            </div>
        </div>
    );
}
