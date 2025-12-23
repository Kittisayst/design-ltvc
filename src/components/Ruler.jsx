import React, { useEffect, useRef, useState } from 'react';

export function Ruler({ type = 'horizontal', canvasManager }) {
    const canvasRef = useRef(null);
    const [viewportState, setViewportState] = useState({ zoom: 1, offset: { x: 0, y: 0 } });

    useEffect(() => {
        if (!canvasManager) return;

        const updateRuler = () => {
            if (!canvasManager.canvas) return;
            const zoom = canvasManager.canvas.getZoom();
            const vpt = canvasManager.canvas.viewportTransform; // [scaleX, skewY, skewX, scaleY, translateX, translateY]

            setViewportState({
                zoom: zoom,
                offset: {
                    x: vpt[4],
                    y: vpt[5]
                }
            });
        };

        // Initial update
        updateRuler();

        if (!canvasManager.canvas) return;

        // Listen for canvas events that change viewport
        canvasManager.canvas.on('mouse:wheel', updateRuler); // Zoom
        canvasManager.canvas.on('mouse:move', (e) => {
            // Only update if panning (how do we know? usually panning changes vpt)
            // Ideally we listen to a specific 'viewport:transformed' event if we added one, 
            // or just hook into mouse:move if panning is active.
            // For now, let's update on render loop or specific events.
            if (canvasManager.canvas.isDragging) { // Assuming isDragging flag is used for hand tool
                updateRuler();
            }
        });
        canvasManager.canvas.on('mouse:up', updateRuler); // End of pan
        // Also listen to programmatic zoom
        // canvasManager.onZoomChange(updateRuler); // If we have this

        // Fabric doesn't fire a generic 'viewport:change' event by default, 
        // but our viewport logic might.
        // Let's hook into `after:render` for smoothest sync during animations/drags
        canvasManager.canvas.on('after:render', updateRuler);

        return () => {
            if (canvasManager.canvas) {
                canvasManager.canvas.off('mouse:wheel', updateRuler);
                canvasManager.canvas.off('after:render', updateRuler);
                canvasManager.canvas.off('mouse:move', updateRuler);
                canvasManager.canvas.off('mouse:up', updateRuler);
            }
        };
    }, [canvasManager]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { zoom, offset } = viewportState;

        // Resize canvas to match container
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f3f4f6'; // Light gray background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#6b7280'; // Text color
        ctx.strokeStyle = '#9ca3af'; // Tick color
        ctx.lineWidth = 1;
        ctx.font = '10px Inter, sans-serif';

        // Ruler Logic
        // We need to map screen pixels to canvas coordinates.
        // Screen X = (Canvas X * zoom) + offset X
        // Canvas X = (Screen X - offset X) / zoom

        const startPixel = 0;
        const endPixel = type === 'horizontal' ? canvas.width : canvas.height;

        // Determine step size based on zoom
        let step = 50; // default step in canvas units
        if (zoom > 2) step = 10;
        if (zoom > 5) step = 5;
        if (zoom < 0.5) step = 100;
        if (zoom < 0.2) step = 500;

        // Start coordinate in canvas units
        const startVal = type === 'horizontal'
            ? (startPixel - offset.x) / zoom
            : (startPixel - offset.y) / zoom;

        // Setup loop to draw ticks
        // Snap to nearest step
        const firstTick = Math.ceil(startVal / step) * step;

        // Screen position of the first tick
        let currentPos = type === 'horizontal'
            ? (firstTick * zoom) + offset.x
            : (firstTick * zoom) + offset.y;

        const stepScreen = step * zoom;
        let val = firstTick;

        ctx.beginPath();

        // Loop while currentPos is within visible range
        while (currentPos < endPixel) {
            // Draw tick
            const tickSize = val % (step * 2) === 0 ? 12 : 6; // Major vs Minor ticks

            if (type === 'horizontal') {
                ctx.moveTo(currentPos, canvas.height - tickSize);
                ctx.lineTo(currentPos, canvas.height);
                if (val % (step * 2) === 0) {
                    ctx.fillText(Math.round(val), currentPos + 2, 14);
                }
            } else {
                ctx.moveTo(canvas.width - tickSize, currentPos);
                ctx.lineTo(canvas.width, currentPos);
                if (val % (step * 2) === 0) {
                    // Vertical text rotation
                    ctx.save();
                    ctx.translate(12, currentPos + 10);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText(Math.round(val), 0, 0);
                    ctx.restore();
                }
            }

            val += step;
            currentPos += stepScreen;
        }
        ctx.stroke();

    }, [viewportState, type]);

    const handleMouseDown = (e) => {
        if (!canvasManager) return;
        e.preventDefault();

        // 1. Calculate drop position in canvas coords
        // Standard fabric transform:
        const zoom = canvasManager.canvas.getZoom();
        const vpt = canvasManager.canvas.viewportTransform;

        // Initial position (mouse pos)
        const getCanvasCoord = (clientX, clientY) => {
            // Basic invert transform
            // CanvasX = (ScreenX - vpt[4]) / zoom
            // CanvasY = (ScreenY - vpt[5]) / zoom

            // We need client coordinates relative to the canvas ELEMENT, not viewport window?
            // Actually Transform uses raw values usually related to the canvas container.
            // But clientX is screen.
            // Let's get canvas rect.
            const rect = canvasManager.canvas.getElement().getBoundingClientRect();

            // Relative to canvas element
            const relX = clientX - rect.left;
            const relY = clientY - rect.top;

            const canvasX = (relX - vpt[4]) / zoom;
            const canvasY = (relY - vpt[5]) / zoom;

            return { x: canvasX, y: canvasY };
        };

        const startPos = getCanvasCoord(e.clientX, e.clientY);
        const guideOffset = type === 'horizontal' ? startPos.y : startPos.x;

        // 2. Create Guide
        const guide = canvasManager.addGuide(type, guideOffset);

        // 3. Drag Logic
        const handleMouseMove = (mvEvent) => {
            const currentPos = getCanvasCoord(mvEvent.clientX, mvEvent.clientY);

            if (type === 'horizontal') {
                guide.set('top', currentPos.y);
            } else {
                guide.set('left', currentPos.x);
            }
            guide.setCoords(); // Important for hit testing
            canvasManager.canvas.requestRenderAll();
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            // Optional: Check if dropped back on ruler to delete?
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                background: 'var(--bg-tertiary)',
                cursor: type === 'horizontal' ? 'ns-resize' : 'ew-resize'
            }}
        />
    );
}
