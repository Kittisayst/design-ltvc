import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
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
import { PageNavigator } from './components/PageNavigator.jsx';
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { ResizeHandle } from './components/ResizeHandle.jsx';

import { useStore } from './store/useStore';

export default function App() {
    const canvasRef = useRef(null);
    const {
        activeTab,
        setActiveTab,
        showRulers,
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
        colorPickerAlign,
        theme,
        leftSidebarOpen,
        toggleLeftSidebar,
        rightSidebarOpen,
        toggleRightSidebar,
    } = useStore();

    // Initialize theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, []);

    const {
        canvasManager,
        currentColor,
        setCurrentColor,
    } = useCanvas();

    const [searchParams] = useSearchParams();
    const [showWelcome, setShowWelcome] = useState(true);

    // Template Loading Logic — auto-dismiss welcome if template param exists
    useEffect(() => {
        if (!canvasManager) return;

        const templatePath = searchParams.get('template');
        if (templatePath) {
            setShowWelcome(false);
            fetch(templatePath)
                .then(res => res.json())
                .then(json => canvasManager.loadProject(json))
                .catch(err => console.error('Failed to load template:', err));
        }
    }, [canvasManager, searchParams]);

    const handleColorChange = (color) => {
        setCurrentColor(color);
        if (canvasManager) {
            canvasManager.updateActiveObject(activeColorProp || 'fill', color);
        }
    };

    return (
        <div id="app-react-root">
            {showWelcome && canvasManager && (
                <WelcomeScreen
                    canvasManager={canvasManager}
                    onDismiss={() => setShowWelcome(false)}
                />
            )}
            <Navbar
                onOpenShortcuts={() => setShowShortcuts(true)}
                onOpenExport={() => setShowExport(true)}
                onOpenResize={() => setShowResize(true)}
            />

            {/* Workspace */}
            <div className="workspace">
                {/* Left Sidebar Toggle (outside aside to avoid overflow clip) */}
                <button
                    className={`sidebar-toggle-outer sidebar-toggle-outer-left ${leftSidebarOpen ? 'open' : ''}`}
                    onClick={toggleLeftSidebar}
                    aria-label="Toggle left sidebar"
                    title={leftSidebarOpen ? 'Hide left panel' : 'Show left panel'}
                >
                    {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </button>

                {/* Left Sidebar */}
                <aside className={`sidebar ${leftSidebarOpen ? '' : 'collapsed'}`}>
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
                        <button className="sidebar-close-btn-inline" onClick={toggleLeftSidebar} aria-label="Hide left panel" title="Hide left panel">
                            <PanelLeftClose size={14} />
                        </button>
                    </div>
                    <div id="elements-wrapper">
                        {activeTab === 'elements' ? (
                            <ElementsPanel />
                        ) : (
                            <TemplatesPanel />
                        )}
                    </div>
                    {leftSidebarOpen && <ResizeHandle side="left" minWidth={240} maxWidth={480} />}
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
                                <Ruler type="horizontal" />
                            </div>

                            {/* Vertical Ruler */}
                            <div className="ruler-vertical-container">
                                <Ruler type="vertical" />
                            </div>
                        </>
                    )}

                    <main className="canvas-area" id="canvas-wrapper">
                        <div className="canvas-container-wrapper">
                            <canvas id="c" ref={canvasRef}></canvas>
                        </div>
                        <PageNavigator />
                    </main>
                </div>

                {/* Right Sidebar Toggle (outside aside to avoid overflow clip) */}
                <button
                    className={`sidebar-toggle-outer sidebar-toggle-outer-right ${rightSidebarOpen ? 'open' : ''}`}
                    onClick={toggleRightSidebar}
                    aria-label="Toggle right sidebar"
                    title={rightSidebarOpen ? 'Hide right panel' : 'Show right panel'}
                >
                    {rightSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                </button>

                {/* Right Sidebar */}
                <aside className={`sidebar-right ${rightSidebarOpen ? '' : 'collapsed'}`}>
                    {rightSidebarOpen && <ResizeHandle side="right" minWidth={220} maxWidth={420} />}
                    <button className="sidebar-close-btn sidebar-close-right" onClick={toggleRightSidebar} aria-label="Hide right panel" title="Hide right panel">
                        <PanelRightClose size={14} />
                    </button>
                    <div className="section-title">Properties</div>
                    <PropertyPanel />

                    <div className="section-divider"></div>

                    <div className="section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="section-title">Layers</div>
                        <LayersPanel />
                    </div>
                </aside>
            </div>

            {/* Floating Toolbar - Self contained */}
            <FloatingToolbar />
            <CropToolbar />

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
