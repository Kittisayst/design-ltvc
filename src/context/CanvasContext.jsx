import { createContext, useContext, useState, useEffect } from 'react';
import { CanvasManager } from '../core/CanvasManager';

const CanvasContext = createContext(null);

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('useCanvas must be used within a CanvasProvider');
    }
    return context;
}

export function CanvasProvider({ children }) {
    const [canvasManager, setCanvasManager] = useState(null);
    const [activeObject, setActiveObject] = useState(null);
    const [currentColor, setCurrentColor] = useState('#000000');

    // Initialize CanvasManager
    useEffect(() => {
        const cm = new CanvasManager('c', {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff'
        });
        setCanvasManager(cm);
        window.canvasManager = cm;

        return () => {
            cm.dispose();
        };
    }, []);

    // Listen for Active Object Changes
    useEffect(() => {
        if (!canvasManager) return;

        const updateActive = () => {
            const active = canvasManager.getActiveObject();
            setActiveObject(active);

            if (active && active.fill && typeof active.fill === 'string') {
                setCurrentColor(active.fill);
            }
        };

        canvasManager.canvas.on('selection:created', updateActive);
        canvasManager.canvas.on('selection:updated', updateActive);
        canvasManager.canvas.on('selection:cleared', () => {
            setActiveObject(null);
            // Color picker visibility is now handled via useStore in App.jsx and components
        });
        canvasManager.canvas.on('object:updated', updateActive);

        return () => {
            if (canvasManager.canvas) {
                canvasManager.canvas.off('selection:created', updateActive);
                canvasManager.canvas.off('selection:updated', updateActive);
                canvasManager.canvas.off('selection:cleared', updateActive);
                canvasManager.canvas.off('object:updated', updateActive);
            }
        };
    }, [canvasManager]);

    const value = {
        canvasManager,
        activeObject,
        currentColor,
        setCurrentColor,
    };

    return (
        <CanvasContext.Provider value={value}>
            {children}
        </CanvasContext.Provider>
    );
}
