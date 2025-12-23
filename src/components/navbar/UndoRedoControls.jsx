import React, { useEffect, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

export function UndoRedoControls({ canvasManager }) {
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        const handleHistoryUpdate = (e) => {
            setCanUndo(e.detail.canUndo);
            setCanRedo(e.detail.canRedo);
        };

        window.addEventListener('historyUpdate', handleHistoryUpdate);

        // Initial check
        if (canvasManager && canvasManager.historyManager) {
            setCanUndo(canvasManager.historyManager.canUndo());
            setCanRedo(canvasManager.historyManager.canRedo());
        }

        return () => window.removeEventListener('historyUpdate', handleHistoryUpdate);
    }, [canvasManager]);

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
