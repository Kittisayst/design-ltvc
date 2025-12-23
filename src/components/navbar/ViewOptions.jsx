import { useState } from 'react';
import { Ruler, Grid3x3 } from 'lucide-react';

export function ViewOptions({ canvasManager, showRulers, setShowRulers }) {
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
        </div>
    );
}
