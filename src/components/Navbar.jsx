import { LayoutGrid, Scaling, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ZoomControls } from './navbar/ZoomControls';
import { ViewOptions } from './navbar/ViewOptions';
import { UndoRedoControls } from './navbar/UndoRedoControls';
import { ActionButtons } from './navbar/ActionButtons';
import { BackgroundControl } from './navbar/BackgroundControl';

export function Navbar({ onOpenShortcuts, onOpenExport, onOpenResize }) {
    return (
        <nav className="navbar">
            {/* Left Section */}
            <div className="nav-left">
                <Link to="/" className="icon-btn nav-link-btn" title="Back to Dashboard">
                    <LayoutGrid size={20} />
                </Link>
                <Link to="/" className="logo nav-brand">CanvasPro</Link>

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
                <ActionButtons onExport={onOpenExport} />
                <div className="separator-vertical"></div>
                <UndoRedoControls />
                <div className="separator-vertical"></div>
                <ZoomControls />
            </div>

            {/* Right Section */}
            <div className="nav-right nav-right-group">
                <button className="icon-btn" onClick={onOpenShortcuts} title="Keyboard Shortcuts">
                    <Keyboard size={18} />
                </button>
                <div className="separator-vertical"></div>
                <BackgroundControl />
                <div className="separator-vertical"></div>
                <ViewOptions />
            </div>
        </nav>
    );
}
