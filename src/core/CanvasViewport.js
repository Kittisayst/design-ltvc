import { Point } from 'fabric';

export class CanvasViewport {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.canvas = canvasManager.canvas;
        this._isDisposed = false;

        // State
        this.isDragging = false;
        this.isSpacePanning = false;
        this.isHandMode = false;
        this.lastPosX = 0;
        this.lastPosY = 0;

        // References
        this.canvasWrapper = document.getElementById('canvas-wrapper');

        // Callbacks
        this.zoomCallback = null;

        // Handlers needed for removal
        this.handleWindowResize = () => {
            if (this.canvasWrapper && !this._isDisposed) {
                this.resizeCanvasElement(this.canvasWrapper.clientWidth, this.canvasWrapper.clientHeight);
            }
        };

        // Init
        this.setupZoomPan();

        // Auto Resize on Window Resize
        window.addEventListener('resize', this.handleWindowResize);

        // Initial Resize to fill
        if (this.canvasWrapper) {
            this.resizeTimeout = setTimeout(() => {
                if (!this._isDisposed) {
                    this.resizeCanvasElement(this.canvasWrapper.clientWidth, this.canvasWrapper.clientHeight);
                }
            }, 0);
        }
    }

    dispose() {
        this._isDisposed = true;
        window.removeEventListener('resize', this.handleWindowResize);
        clearTimeout(this.resizeTimeout);
    }

    onZoomChange(callback) {
        this.zoomCallback = callback;
    }

    setupZoomPan() {
        // Zoom on Alt + Wheel (Mouse Point Zoom)
        this.canvas.on('mouse:wheel', (opt) => {
            if (!opt.e.altKey) return;

            const delta = opt.e.deltaY;
            let zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;

            if (zoom > 5) zoom = 5;
            if (zoom < 0.05) zoom = 0.05;

            // Zoom to mouse point
            const point = new Point(opt.e.offsetX, opt.e.offsetY);
            this.canvas.zoomToPoint(point, zoom);

            if (this.zoomCallback) this.zoomCallback(zoom);

            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        this.canvas.on('mouse:down', (opt) => {
            const evt = opt.e;
            if (this.isSpacePanning || this.isHandMode) {
                this.isDragging = true;
                this.canvas.selection = false;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
                this.canvas.setCursor('grabbing');
            }
        });

        // Panning (Infinite)
        this.canvas.on('mouse:move', (opt) => {
            if (this.isDragging) {
                const e = opt.e;
                const deltaX = e.clientX - this.lastPosX;
                const deltaY = e.clientY - this.lastPosY;

                this.canvas.relativePan(new Point(deltaX, deltaY));

                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
                opt.e.preventDefault();
            }
        });

        this.canvas.on('mouse:up', () => {
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            this.isDragging = false;
            if (this.isHandMode || this.isSpacePanning) {
                this.canvas.setCursor('grab');
            }
            // Only restore selection if not in permanent hand mode
            if (!this.isHandMode && !this.isSpacePanning) {
                this.canvas.selection = true;
                this.canvas.setCursor('default');
            } else {
                this.canvas.setCursor('grab');
            }
        });
    }

    setZoom(value) {
        let zoom = value;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.05) zoom = 0.05;

        // Zoom to Center of Canvas
        const center = new Point(this.canvas.width / 2, this.canvas.height / 2);
        this.canvas.zoomToPoint(center, zoom);

        if (this.zoomCallback) this.zoomCallback(zoom);
    }

    zoomIn() {
        this.setZoom(this.canvas.getZoom() * 1.2);
    }

    zoomOut() {
        this.setZoom(this.canvas.getZoom() / 1.2);
    }

    resetZoom() {
        // Reset to 100% and Center the Workspace
        const zoom = 1;

        if (!this.cm.originalWidth) {
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        } else {
            const canvasW = this.canvas.width;
            const canvasH = this.canvas.height;
            const pageW = this.cm.originalWidth;
            const pageH = this.cm.originalHeight;

            const x = (canvasW - pageW * zoom) / 2;
            const y = (canvasH - pageH * zoom) / 2;

            this.canvas.setViewportTransform([zoom, 0, 0, zoom, x, y]);
        }

        if (this.zoomCallback) this.zoomCallback(zoom);
    }

    fitToScreen() {
        // If we want "Fit to Screen", we need to calculate scale to fit originalWidth in current canvas width
        // Assuming originalWidth is the "Content Size"
        if (!this.cm.originalWidth) return;

        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;

        const scaleX = (canvasW - 80) / this.cm.originalWidth;
        const scaleY = (canvasH - 80) / this.cm.originalHeight;

        let scale = Math.min(scaleX, scaleY);
        // if (scale > 1) scale = 1; // Optional: don't zoom in if it fits 

        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset first
        // Center it
        const x = (canvasW - this.cm.originalWidth * scale) / 2;
        const y = (canvasH - this.cm.originalHeight * scale) / 2;

        this.canvas.setViewportTransform([scale, 0, 0, scale, x, y]);
        this.canvas.requestRenderAll();

        if (this.zoomCallback) this.zoomCallback(scale);
    }

    resizeCanvasElement(width, height) {
        // Resize the actual Fabric Canvas element to fill the container
        this.canvas.setDimensions({ width: parseInt(width), height: parseInt(height) });
    }

    resizePage(width, height) {
        // Resize the Logical Page (Workspace)
        const w = parseInt(width);
        const h = parseInt(height);

        this.cm.originalWidth = w;
        this.cm.originalHeight = h;

        if (this.cm.workspace) {
            this.cm.workspace.set({ width: w, height: h });
            this.cm.workspace.setCoords();
            this.cm.canvas.requestRenderAll();
        }

        // Re-center logic if needed, but for now we just resize the bounding box
        this.resetZoom();
    }

    toggleHandMode() {
        if (this._isDisposed || !this.canvas) return false;

        this.isHandMode = !this.isHandMode;
        if (this.isHandMode) {
            this.canvas.selection = false;
            this.canvas.defaultCursor = 'grab';
            this.canvas.hoverCursor = 'grab';
            this.canvas.moveCursor = 'grab';
            this.canvas.setCursor('grab');
        } else {
            this.canvas.selection = true;
            this.canvas.defaultCursor = 'default';
            this.canvas.hoverCursor = 'move';
            this.canvas.moveCursor = 'move';
            this.canvas.setCursor('default');
        }
        return this.isHandMode;
    }

    setSpacePanning(isActive) {
        if (this._isDisposed || !this.canvas) return;
        if (this.isSpacePanning === isActive) return;
        this.isSpacePanning = isActive;

        if (isActive) {
            this.canvas.selection = false;
            this.canvas.defaultCursor = 'grab';
            this.canvas.hoverCursor = 'grab';
            this.canvas.moveCursor = 'grab';
            this.canvas.setCursor('grab');
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
        } else {
            if (!this.isHandMode) {
                this.canvas.selection = true;
                this.canvas.defaultCursor = 'default';
                this.canvas.hoverCursor = 'move';
                this.canvas.moveCursor = 'move';
                this.canvas.setCursor('default');
            }
            this.isDragging = false;
            this.canvas.requestRenderAll();
        }
    }
}
