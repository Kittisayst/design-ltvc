import React, { useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useCanvas } from '../../context/CanvasContext';

export function UndoRedoControls() {
    const { canvasManager } = useCanvas();
    const canUndo = useStore((s) => s.canUndo);
    const canRedo = useStore((s) => s.canRedo);

    // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    canvasManager?.redo();
                } else {
                    canvasManager?.undo();
                }
            }
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                canvasManager?.redo();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canvasManager]);

    return (
        <div className="navbar-group">
            <button
                className="icon-btn"
                title="Undo (Ctrl+Z)"
                onClick={() => canvasManager?.undo()}
                disabled={!canUndo}
            >
                <RotateCcw size={16} />
            </button>
            <button
                className="icon-btn"
                title="Redo (Ctrl+Y)"
                onClick={() => canvasManager?.redo()}
                disabled={!canRedo}
            >
                <RotateCw size={16} />
            </button>
        </div>
    );
}
