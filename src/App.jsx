import { useEffect, useRef } from 'react';
import { useCanvas } from './context/CanvasContext';
import { Navbar } from './components/Navbar.jsx';
import { FloatingToolbar } from './components/FloatingToolbar.jsx';
import { ColorPicker } from './components/ColorPicker.jsx';
import { LayersPanel } from './components/LayersPanel.jsx';
import { PropertyPanel } from './components/PropertyPanel.jsx';
import { ElementsPanel } from './components/ElementsPanel.jsx';
import { TemplatesPanel } from './components/TemplatesPanel.jsx';
import { ContextMenu } from './components/ContextMenu.jsx';
import { Ruler } from './components/Ruler.jsx';
import { ShortcutsModal } from './components/ShortcutsModal.jsx';
import { ExportModal } from './components/ExportModal.jsx';
import { ResizeModal } from './components/ResizeModal.jsx';
import { CropToolbar } from './components/canvas/CropToolbar.jsx';

import { useStore } from './store/useStore';

export default function App() {
    const canvasRef = useRef(null);
    const {
        activeTab,
        setActiveTab,
        showRulers,
        setShowRulers,
        showShortcuts,
        setShowShortcuts,
        showExport,
        setShowExport,
        showResize,
        setShowResize,
        colorPickerVisible,
        setColorPickerVisible,
        colorPickerAnchor,
        activeColorProp,
        colorPickerAlign
    } = useStore();

    const {
        canvasManager,
        currentColor,
        setCurrentColor,
    } = useCanvas();

    // Template Loading Logic
    useEffect(() => {
        if (!canvasManager) return;

        const urlParams = new URLSearchParams(window.location.search);
        const templatePath = urlParams.get('template');
        if (templatePath) {
            fetch(templatePath)
                .then(res => res.json())
                .then(json => canvasManager.loadProject(json))
                .catch(err => console.error('Failed to load template:', err));
        }
    }, [canvasManager]);

    const handleColorChange = (color) => {
        setCurrentColor(color);
        if (canvasManager) {
            canvasManager.updateActiveObject(activeColorProp || 'fill', color);
        }
    };

    return (
        <div id="app-react-root">
            <Navbar
                canvasManager={canvasManager}
                showRulers={showRulers}
                setShowRulers={setShowRulers}
                onOpenShortcuts={() => setShowShortcuts(true)}
                onOpenExport={() => setShowExport(true)}
                onOpenResize={() => setShowResize(true)}
            />

            {/* Workspace */}
            <div className="workspace">
                {/* Left Sidebar */}
                <aside className="sidebar">
                    <div className="panel-tabs-container">
                        <button
                            className={`panel-tab-btn ${activeTab === 'elements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('elements')}
                        >
                            Elements
                        </button>
                        <button
                            className={`panel-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('templates')}
                        >
                            Templates
                        </button>
                    </div>
                    <div id="elements-wrapper">
                        {activeTab === 'elements' ? (
                            <ElementsPanel canvasManager={canvasManager} />
                        ) : (
                            <TemplatesPanel canvasManager={canvasManager} />
                        )}
                    </div>
                </aside>

                {/* Canvas Area */}
                <div id="ruler-wrapper">

                    {/* Rulers Overlay */}
                    {showRulers && (
                        <>
                            {/* Corner Box */}
                            <div className="ruler-corner-box"></div>

                            {/* Horizontal Ruler */}
                            <div className="ruler-horizontal-container">
                                <Ruler type="horizontal" canvasManager={canvasManager} />
                            </div>

                            {/* Vertical Ruler */}
                            <div className="ruler-vertical-container">
                                <Ruler type="vertical" canvasManager={canvasManager} />
                            </div>
                        </>
                    )}

                    <main className="canvas-area" id="canvas-wrapper">
                        <div className="canvas-container-wrapper">
                            <canvas id="c" ref={canvasRef}></canvas>
                        </div>
                    </main>
                </div>

                {/* Right Sidebar */}
                <aside className="sidebar-right">
                    <div className="section-title">Properties</div>
                    <PropertyPanel canvasManager={canvasManager} />

                    <div className="section-divider"></div>

                    <div className="section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="section-title">Layers</div>
                        <LayersPanel canvasManager={canvasManager} />
                    </div>
                </aside>
            </div>

            {/* Floating Toolbar - Self contained */}
            <FloatingToolbar />
            <CropToolbar canvasManager={canvasManager} />

            {/* Context Menu - Self contained */}
            <ContextMenu />

            {/* Color Picker */}
            {colorPickerVisible && (
                <ColorPicker
                    color={currentColor}
                    onChange={handleColorChange}
                    onClose={() => setColorPickerVisible(false)}
                    anchorEl={colorPickerAnchor}
                    align={colorPickerAlign}
                />
            )}

            <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

            <ExportModal
                isOpen={showExport}
                onClose={() => setShowExport(false)}
                onExport={(options) => canvasManager?.exportImage(options)}
            />

            <ResizeModal
                isOpen={showResize}
                onClose={() => setShowResize(false)}
                onApply={(w, h) => canvasManager?.resize(w, h)}
                currentWidth={canvasManager?.originalWidth || 800}
                currentHeight={canvasManager?.originalHeight || 600}
            />
        </div>
    );
}
