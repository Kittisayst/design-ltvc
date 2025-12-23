import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Hand, Minus, Plus, Maximize, ChevronDown } from 'lucide-react';

export function ZoomControls({ canvasManager }) {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [isHandMode, setIsHandMode] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Close dropdown when complying with outside clicks
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!canvasManager) return;
        const handleZoomChange = (zoom) => setZoomLevel(Math.round(zoom * 100));
        canvasManager.onZoomChange(handleZoomChange);

        // Initial zoom
        if (canvasManager.canvas) {
            setZoomLevel(Math.round(canvasManager.canvas.getZoom() * 100));
        }

    }, [canvasManager]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    const handleDrawMode = () => {
        if (!canvasManager) return;
        if (isDrawMode) {
            canvasManager.disableDrawingMode();
            setIsDrawMode(false);
        } else {
            canvasManager.enableDrawingMode();
            setIsDrawMode(true);
            setIsHandMode(false);
        }
    };

    const handleHandTool = () => {
        if (!canvasManager) return;
        const newState = canvasManager.toggleHandMode();
        setIsHandMode(newState);
        if (newState) setIsDrawMode(false);
    };

    const handleZoomIn = () => canvasManager?.zoomIn();
    const handleZoomOut = () => canvasManager?.zoomOut();
    const handleZoomReset = () => canvasManager?.resetZoom();

    const handlePresetZoom = (percent) => {
        canvasManager?.setZoom(percent / 100);
        setShowDropdown(false);
    };

    const handleFit = () => {
        canvasManager?.fitToScreen();
        setShowDropdown(false);
    };

    return (
        <div className="zoom-toolbar-nav navbar-group">
            <button
                className={`icon-btn ${isDrawMode ? 'active' : ''}`}
                onClick={handleDrawMode}
                title="Free Drawing"
            >
                <Pencil size={18} />
            </button>

            <div className="separator-vertical"></div>

            <button
                className={`icon-btn ${isHandMode ? 'active' : ''}`}
                onClick={handleHandTool}
                title="Hand Tool (Space)"
            >
                <Hand size={18} />
            </button>

            <div className="separator-vertical"></div>

            <button className="icon-btn" onClick={handleZoomOut} title="Zoom Out">
                <Minus size={18} />
            </button>

            {/* Zoom Dropdown */}
            <div className="zoom-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    className="zoom-display-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        minWidth: '70px',
                        justifyContent: 'center'
                    }}
                >
                    {zoomLevel}% <ChevronDown size={12} />
                </button>

                {showDropdown && (
                    <div className="zoom-dropdown-menu" style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        background: '#2b2d30',
                        border: '1px solid #3e4042',
                        borderRadius: '6px',
                        padding: '4px 0',
                        minWidth: '120px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        whiteSpace: 'nowrap'
                    }}>
                        {[25, 50, 75, 100, 150, 200, 300].map(val => (
                            <button
                                key={val}
                                onClick={() => handlePresetZoom(val)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#e0e0e0',
                                    padding: '6px 16px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#3e4042'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                {val}%
                            </button>
                        ))}
                        <div style={{ height: '1px', background: '#3e4042', margin: '4px 0' }}></div>
                        <button
                            onClick={handleFit}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e0e0e0',
                                padding: '6px 16px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '13px',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#3e4042'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            Fit to Screen
                        </button>
                    </div>
                )}
            </div>

            <button className="icon-btn" onClick={handleZoomIn} title="Zoom In">
                <Plus size={18} />
            </button>

            <button className="icon-btn" onClick={handleZoomReset} title="Reset Zoom">
                <Maximize size={18} />
            </button>
        </div>
    );
}
