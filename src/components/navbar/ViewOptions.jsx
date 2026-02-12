import { useState } from 'react';
import { Ruler, Grid3x3, Sun, Moon } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';
import { useStore } from '../../store/useStore';

export function ViewOptions() {
    const { canvasManager } = useCanvas();
    const { showRulers, setShowRulers, theme, toggleTheme } = useStore();
    const [gridVisible, setGridVisible] = useState(false);

    const handleToggleRulers = () => {
        if (setShowRulers) {
            setShowRulers(!showRulers);
        }
    };

    const handleToggleGrid = () => {
        if (canvasManager) {
            const newState = canvasManager.toggleGrid();
            setGridVisible(newState);
        }
    };

    return (
        <div className="nav-action-group">
            <button
                className={`icon-btn ${showRulers ? 'active' : ''}`}
                onClick={handleToggleRulers}
                title="Toggle Rulers"
            >
                <Ruler size={16} />
            </button>
            <button
                className={`icon-btn ${gridVisible ? 'active' : ''}`}
                onClick={handleToggleGrid}
                title="Toggle Grid"
            >
                <Grid3x3 size={16} />
            </button>
            <button
                className="icon-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
        </div>
    );
}
