import React, { useState, useEffect, useRef } from 'react';
import { Pencil, PenLine, Hand, Minus, Plus, Maximize, ChevronDown } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';

export function ZoomControls() {
    const { canvasManager } = useCanvas();
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [isPenMode, setIsPenMode] = useState(false);
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
            if (isPenMode) { canvasManager.penToolManager.disable(); setIsPenMode(false); }
            canvasManager.enableDrawingMode();
            setIsDrawMode(true);
            setIsHandMode(false);
        }
    };

    const handlePenTool = () => {
        if (!canvasManager) return;
        if (isPenMode) {
            canvasManager.penToolManager.disable();
            setIsPenMode(false);
        } else {
            if (isDrawMode) { canvasManager.disableDrawingMode(); setIsDrawMode(false); }
            canvasManager.penToolManager.enable();
            setIsPenMode(true);
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
                aria-label="Free Drawing"
            >
                <Pencil size={18} />
            </button>

            <button
                className={`icon-btn ${isPenMode ? 'active' : ''}`}
                onClick={handlePenTool}
                title="Pen Tool"
                aria-label="Pen Tool"
            >
                <PenLine size={18} />
            </button>

            <div className="separator-vertical"></div>

            <button
                className={`icon-btn ${isHandMode ? 'active' : ''}`}
                onClick={handleHandTool}
                title="Hand Tool (Space)"
                aria-label="Hand Tool"
            >
                <Hand size={18} />
            </button>

            <div className="separator-vertical"></div>

            <button className="icon-btn" onClick={handleZoomOut} title="Zoom Out" aria-label="Zoom Out">
                <Minus size={18} />
            </button>

            {/* Zoom Dropdown */}
            <div className="zoom-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    className="zoom-level-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label={`Zoom level ${zoomLevel}%`}
                >
                    {zoomLevel}% <ChevronDown size={12} />
                </button>

                {showDropdown && (
                    <div className="zoom-dropdown-menu">
                        {[25, 50, 75, 100, 150, 200, 300].map(val => (
                            <button
                                key={val}
                                className="zoom-dropdown-item"
                                onClick={() => handlePresetZoom(val)}
                            >
                                {val}%
                            </button>
                        ))}
                        <div className="zoom-dropdown-divider"></div>
                        <button className="zoom-dropdown-item" onClick={handleFit}>
                            Fit to Screen
                        </button>
                    </div>
                )}
            </div>

            <button className="icon-btn" onClick={handleZoomIn} title="Zoom In" aria-label="Zoom In">
                <Plus size={18} />
            </button>

            <button className="icon-btn" onClick={handleZoomReset} title="Reset Zoom" aria-label="Reset Zoom">
                <Maximize size={18} />
            </button>
        </div>
    );
}
