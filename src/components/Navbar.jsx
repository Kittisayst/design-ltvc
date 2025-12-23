import { LayoutGrid, Scaling, Keyboard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ZoomControls } from './navbar/ZoomControls';
import { ViewOptions } from './navbar/ViewOptions';
import { UndoRedoControls } from './navbar/UndoRedoControls';

import { ActionButtons } from './navbar/ActionButtons';
import { BackgroundControl } from './navbar/BackgroundControl';

export function Navbar({ canvasManager, onOpenShortcuts, onOpenExport, onOpenResize }) {
    const { showRulers, setShowRulers } = useStore();
    return (
        <nav className="navbar">
            {/* Left Section */}
            <div className="nav-left">
                <a href="index.html" className="icon-btn nav-link-btn" title="Back to Dashboard">
                    <LayoutGrid size={20} />
                </a>
                <a href="index.html" className="logo nav-brand">CanvasPro</a>

                {/* Canvas Size Controls */}
                <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px', marginRight: '12px' }}>
                    <button id="btn-open-resize" className="btn btn-sm" title="Resize Canvas" onClick={onOpenResize}>
                        <Scaling size={16} />
                        <span>Resize</span>
                    </button>
                </div>
            </div>

            {/* Center Section */}
            <div className="nav-center">


                <div className="separator-vertical"></div>

                <ActionButtons canvasManager={canvasManager} onExport={onOpenExport} />

                <div className="separator-vertical"></div>
                <UndoRedoControls canvasManager={canvasManager} />
                <div className="separator-vertical"></div>

                {/* Zoom Controls */}
                <ZoomControls canvasManager={canvasManager} />
            </div>

            {/* Right Section */}
            <div className="nav-right nav-right-group">
                <button className="icon-btn" onClick={onOpenShortcuts} title="Keyboard Shortcuts">
                    <Keyboard size={18} />
                </button>
                <div className="separator-vertical"></div>
                <BackgroundControl canvasManager={canvasManager} />
                <div className="separator-vertical"></div>
                <ViewOptions
                    canvasManager={canvasManager}
                    showRulers={showRulers}
                    setShowRulers={setShowRulers}
                />
            </div>
        </nav>
    );
}
