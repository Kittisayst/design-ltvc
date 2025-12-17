import { Canvas, IText, FabricImage, Gradient, Rect, Circle, Triangle, loadSVGFromURL, filters, Group, Line } from 'fabric';
import { HistoryManager } from './HistoryManager.js';
import { NotificationManager } from '../ui/NotificationManager.js';

export class CanvasManager {
    constructor(canvasId, options = {}) {
        this.canvas = new Canvas(canvasId, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            ...options
        });

        this.history = new HistoryManager(this.canvas);

        // Smart Guides State
        this.snapThreshold = 10;
        this.guidelines = [];

        this.setupEvents();
        this.setupZoomPan();
        this.setupDragDrop();
        this.setupShortcuts();
        this.clipboard = null;
        this.isDragging = false;
        this.lastPosX = 0;
        this.lastPosY = 0;
    }

    // Event Helper (Observer pattern could be better, but basic callback for now)
    onSelectionChange(callback) {
        this.selectionCallback = callback;
    }

    onZoomChange(callback) {
        this.zoomCallback = callback;
    }

    setupEvents() {
        const triggerUpdate = () => {
            if (this.selectionCallback) this.selectionCallback(this.canvas.getActiveObject());
        };

        const saveHistory = () => {
            this.history.saveState();
        };

        this.canvas.on('selection:created', triggerUpdate);
        this.canvas.on('selection:updated', triggerUpdate);
        this.canvas.on('selection:cleared', triggerUpdate);

        // History Triggers
        this.canvas.on('object:modified', () => { triggerUpdate(); saveHistory(); });
        this.canvas.on('object:added', saveHistory); // Capture adds
        // Note: object:removed is tricky, often better to manually save before/after specific actions if logic allows?
        // But 'object:removed' generic listener is fine too.
        this.canvas.on('object:removed', saveHistory);

        this.canvas.on('object:moving', (e) => {
            triggerUpdate();
            this.handleObjectMoving(e);
        });
        this.canvas.on('object:scaling', triggerUpdate);
        this.canvas.on('object:rotating', triggerUpdate);

        this.canvas.on('mouse:up', () => {
            this.clearGuidelines();
            if (this.isDragging) {
                this.canvas.setViewportTransform(this.canvas.viewportTransform);
                this.isDragging = false;
                this.canvas.selection = true;
            }
        });
    }

    setupZoomPan() {
        this.canvas.on('mouse:wheel', (opt) => {
            const delta = opt.e.deltaY;
            let zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.1) zoom = 0.1;
            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            if (this.zoomCallback) this.zoomCallback(zoom);
        });

        // ... dragging logic remains ...


        this.canvas.on('mouse:down', (opt) => {
            const evt = opt.e;
            // Alt key or Space
            if (evt.altKey) {
                this.isDragging = true;
                this.canvas.selection = false;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }
        });

        this.canvas.on('mouse:move', (opt) => {
            if (this.isDragging) {
                const e = opt.e;
                const vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - this.lastPosX;
                vpt[5] += e.clientY - this.lastPosY;
                this.canvas.requestRenderAll();
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });


    }



    setZoom(value) {
        let zoom = value;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        this.canvas.setZoom(zoom);
        // We usually zoom to center when button clicking, or center of viewport
        // But setZoom zooms to 0,0 by default? No, it sets the zoom level.
        // We need to re-center or just set zoom. 
        // Simple setZoom might shift things if not careful with viewport.
        // Better: zoomToPoint(center, zoom)
        const center = this.canvas.getCenter();
        this.canvas.zoomToPoint({ x: center.left, y: center.top }, zoom);

        this.canvas.requestRenderAll();
        if (this.zoomCallback) this.zoomCallback(zoom);
    }

    zoomIn() {
        let zoom = this.canvas.getZoom();
        zoom *= 1.1;
        this.setZoom(zoom);
    }

    zoomOut() {
        let zoom = this.canvas.getZoom();
        zoom /= 1.1;
        this.setZoom(zoom);
    }

    resetZoom() {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.setZoom(1);
    }

    setupDragDrop() {
        const dropZone = this.canvas.wrapperEl;
        // Need to prevent default on dragover for drop to fire
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (f) => this.addImage(f.target.result);
                reader.readAsDataURL(file);
                NotificationManager.success('Image uploaded via drag & drop');
            }
        });
    }

    setupShortcuts() {
        // We bind to document to catch keys even if canvas isn't focused, 
        // but we verify an object is active.
        document.addEventListener('keydown', async (e) => {
            const active = this.getActiveObject();
            if (!active) return;

            // Nudge
            const step = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowLeft') { e.preventDefault(); active.set('left', active.left - step); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); active.set('left', active.left + step); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active.set('top', active.top - step); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); active.set('top', active.top + step); }

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                active.setCoords();
                this.canvas.requestRenderAll();
                // We should technically save history on move end, but for nudge maybe throttle?
                // For now, let's trigger modified manually or leave it visual until next real interaction
                // Or better: fire object:modified
                this.canvas.fire('object:modified', { target: active });
            }

            // Copy / Paste (Ctrl+C / Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC')) {
                e.preventDefault();
                await this.copy();
            }
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyV')) {
                e.preventDefault();
                await this.paste();
            }

            // Group / Ungroup
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyG')) {
                e.preventDefault();
                if (e.shiftKey) {
                    this.ungroup();
                } else {
                    this.group();
                }
            }
        });
    }

    async copy() {
        const active = this.getActiveObject();
        if (active) {
            const clone = await active.clone();
            this.clipboard = clone;
            NotificationManager.info('Copied to clipboard');
        }
    }

    async paste() {
        if (!this.clipboard) return;
        const clone = await this.clipboard.clone();
        this.canvas.discardActiveObject();

        clone.set({
            left: clone.left + 10,
            top: clone.top + 10,
            evented: true
        });

        if (clone.type === 'activeSelection') {
            clone.canvas = this.canvas;
            clone.forEachObject((obj) => this.canvas.add(obj));
            clone.setCoords();
        } else {
            this.canvas.add(clone);
        }

        this.clipboard.top += 10;
        this.clipboard.left += 10;

        this.canvas.setActiveObject(clone);
        this.canvas.requestRenderAll();
        this.history.saveState();
        NotificationManager.success('Pasted object');
    }

    group() {
        const active = this.getActiveObject();
        if (!active || active.type !== 'activeSelection') return;

        active.toGroup();
        this.canvas.requestRenderAll();
        this.history.saveState();
        NotificationManager.success('Grouped objects');
    }

    ungroup() {
        const active = this.getActiveObject();
        if (!active || active.type !== 'group') return;

        active.toActiveSelection();
        this.canvas.requestRenderAll();
        this.history.saveState();
        NotificationManager.success('Ungrouped objects');
    }

    resize(width, height) {
        this.canvas.setDimensions({ width, height });
    }

    setBackgroundColor(color) {
        this.canvas.backgroundColor = color;
        this.canvas.requestRenderAll();
    }

    setBackgroundGradient(start, end, direction, width, height) {
        let coords = { x1: 0, y1: 0, x2: width, y2: 0 };
        if (direction === 'vertical') coords = { x1: 0, y1: 0, x2: 0, y2: height };
        if (direction === 'diagonal') coords = { x1: 0, y1: 0, x2: width, y2: height };

        const gradient = new Gradient({
            type: 'linear',
            coords: coords,
            colorStops: [
                { offset: 0, color: start },
                { offset: 1, color: end }
            ]
        });
        this.canvas.backgroundColor = gradient;
        this.canvas.requestRenderAll();
    }

    addText(text = 'Double click to edit', options = {}) {
        const txt = new IText(text, {
            left: 100,
            top: 100,
            fontFamily: "'Phetsarath OT', 'Noto Sans Lao', sans-serif",
            fill: '#333',
            fontSize: 40,
            ...options
        });
        this.canvas.add(txt);
        this.canvas.setActiveObject(txt);
    }

    async addImage(dataUrl) {
        try {
            const img = await FabricImage.fromURL(dataUrl);
            if (img.width > this.canvas.width) {
                img.scaleToWidth(this.canvas.width / 2);
            }
            this.canvas.add(img);
            this.canvas.centerObject(img);
            this.canvas.setActiveObject(img);
        } catch (err) {
            console.error('Error loading image:', err);
        }
    }

    addShape(type, options = {}) {
        let shape;
        // Basic defaults if not provided in options, but options usually come from JSON
        const opts = { left: 100, top: 100, ...options };

        if (type === 'rect') {
            shape = new Rect(opts);
        } else if (type === 'circle') {
            // Check radius vs width/height mapping if needed, fabric Circle uses radius
            if (opts.width && !opts.radius) opts.radius = opts.width / 2;
            shape = new Circle(opts);
        } else if (type === 'triangle') {
            shape = new Triangle(opts);
        }

        if (shape) {
            this.canvas.add(shape);
            this.canvas.setActiveObject(shape);
            this.canvas.requestRenderAll();
        }
    }

    getActiveObject() {
        return this.canvas.getActiveObject();
    }

    discardActiveObject() {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    removeActiveObject() {
        const active = this.getActiveObject();
        if (active && !active.isEditing) {
            this.canvas.remove(active);
            this.canvas.discardActiveObject(); // Clear selection
            this.canvas.requestRenderAll();
            // Manually trigger callback because 'selection:cleared' might not fire on remove immediately
            if (this.selectionCallback) this.selectionCallback(null);
        }
    }

    // Advanced Controls
    async addSVG(url) {
        try {
            console.log('Attempting to load SVG from:', url);
            const result = await loadSVGFromURL(url);
            console.log('SVG Loaded result:', result);
            const { objects, options } = result;

            if (objects && objects.length > 0) {
                const group = new Group(objects, {
                    ...options,
                    left: 100,
                    top: 100
                });
                this.canvas.add(group);
                this.canvas.setActiveObject(group);
                this.canvas.requestRenderAll();
            } else {
                console.warn('No objects found in SVG');
                NotificationManager.info('Loaded SVG but found no objects.');
            }
        } catch (err) {
            console.error('SVG Load Error', err);
            NotificationManager.error('Failed to load SVG: ' + err.message);
        }
    }



    // Actually, I can use a simpler approach. 
    // `updateActiveObject` is the main thing for color.

    updateActiveObject(prop, value) {
        const active = this.getActiveObject();
        if (!active) return;

        console.log(`Updating active object: prop=${prop}, value=${value}, type=${active.type}`);

        if (prop === 'fill') {
            if (active.type === 'image' || active instanceof FabricImage) {
                // Use the 'tint' property which is the standard way to colorize images/icons in Fabric.js
                // This effectively overlays the color on non-transparent pixels (source-atop/destination-in behavior usually).
                active.set({ tint: value });

                // If we really needed filters, we would do:
                // const filter = new filters.BlendColor({ color: value, mode: 'overlay' });
                // but .tint is simpler and what users expect for "Color Overlay".
            } else if (active.type === 'group' || active.type === 'path-group') {
                // SVG Group: set fill on all children
                // Recursively set fill if needed, but one level deep usually enough for simple icons
                const setFillRecursive = (objects) => {
                    objects.forEach(obj => {
                        if (obj.type === 'group') {
                            setFillRecursive(obj._objects);
                        } else if (obj.set) {
                            obj.set('fill', value);
                        }
                    });
                };

                if (active._objects) setFillRecursive(active._objects);

                // Also set property on group itself just in case
                active.set('fill', value);
            } else {
                // Regular shape (Rect, Circle, IText, etc.)
                active.set('fill', value);
            }
        } else {
            // Existing logic
            if (prop === 'width') active.scaleToWidth(parseInt(value));
            else if (prop === 'height') active.scaleToHeight(parseInt(value));
            else active.set(prop, value);
        }

        active.setCoords();
        this.canvas.requestRenderAll();
    }

    alignActiveObject(position) {
        const activeObj = this.getActiveObject();
        if (!activeObj) return;

        if (activeObj.type === 'activeSelection') {
            const groupWidth = activeObj.width;
            const groupHeight = activeObj.height;
            activeObj.forEachObject((obj) => {
                const objW = obj.getScaledWidth();
                const objH = obj.getScaledHeight();
                switch (position) {
                    case 'left': obj.set({ left: -groupWidth / 2 }); break;
                    case 'center': obj.set({ left: -objW / 2 }); break;
                    case 'right': obj.set({ left: groupWidth / 2 - objW }); break;
                    case 'top': obj.set({ top: -groupHeight / 2 }); break;
                    case 'middle': obj.set({ top: -objH / 2 }); break;
                    case 'bottom': obj.set({ top: groupHeight / 2 - objH }); break;
                }
                obj.setCoords();
            });
        } else {
            switch (position) {
                case 'left': activeObj.set({ left: 0 }); break;
                case 'center': this.canvas.centerObjectH(activeObj); break;
                case 'right': activeObj.set({ left: this.canvas.width - activeObj.getScaledWidth() }); break;
                case 'top': activeObj.set({ top: 0 }); break;
                case 'middle': this.canvas.centerObjectV(activeObj); break;
                case 'bottom': activeObj.set({ top: this.canvas.height - activeObj.getScaledHeight() }); break;
            }
        }
        activeObj.setCoords();
        this.canvas.requestRenderAll();
    }

    flipActiveObject(direction) {
        const active = this.getActiveObject();
        if (active) {
            const prop = direction === 'horizontal' ? 'flipX' : 'flipY';
            active.set(prop, !active[prop]);
            this.canvas.requestRenderAll();
        }
    }

    layerActiveObject(action) {
        const active = this.getActiveObject();
        if (active) {
            if (action === 'up') this.canvas.bringObjectForward(active);
            if (action === 'down') this.canvas.sendObjectBackwards(active);
            this.canvas.requestRenderAll();
        }
    }

    async duplicateActiveObject() {
        const active = this.getActiveObject();
        if (!active) return;
        const cloned = await active.clone();
        this.canvas.discardActiveObject();
        cloned.set({
            left: active.left + 20,
            top: active.top + 20,
            evented: true
        });
        if (cloned.type === 'activeSelection') {
            cloned.canvas = this.canvas;
            cloned.forEachObject((obj) => this.canvas.add(obj));
            cloned.setCoords();
        } else {
            this.canvas.add(cloned);
        }
        this.canvas.setActiveObject(cloned);
        this.canvas.requestRenderAll();
    }

    toggleLockActiveObject() {
        const active = this.getActiveObject();
        if (!active) return;
        const shouldLock = !active.lockMovementX;
        active.set({
            lockMovementX: shouldLock,
            lockMovementY: shouldLock,
            lockRotation: shouldLock,
            lockScalingX: shouldLock,
            lockScalingY: shouldLock,
            // Optional visual feedback handled in UI? or here? 
            // Sticking to logic here. 
        });
        this.canvas.requestRenderAll();
        return shouldLock; // Return state so UI can update
    }
    setTextStyle(prop, value) {
        const active = this.getActiveObject();
        if (active && active.type === 'i-text') {
            active.set(prop, value);
            this.canvas.requestRenderAll();
        }
    }

    toggleTextDecoration(prop) {
        const active = this.getActiveObject();
        if (active && active.type === 'i-text') {
            if (prop === 'fontWeight') {
                const isBold = active.fontWeight === 'bold';
                active.set('fontWeight', isBold ? 'normal' : 'bold');
            } else if (prop === 'fontStyle') {
                const isItalic = active.fontStyle === 'italic';
                active.set('fontStyle', isItalic ? 'normal' : 'italic');
            } else if (prop === 'underline') {
                active.set('underline', !active.underline);
            }
            this.canvas.requestRenderAll();
            return active[prop]; // Return new state for UI update
        }
    }
    exportToImage(filename, quality = 1) {
        const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1, multiplier: quality });
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getCanvasDataURL(quality = 1) {
        return this.canvas.toDataURL({ format: 'png', quality: 1, multiplier: quality });
    }

    saveProject() {
        return JSON.stringify(this.canvas.toJSON());
    }

    async loadProject(json) {
        if (!json) return;
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            await this.canvas.loadFromJSON(data);
            this.canvas.requestRenderAll();
            this.history.saveState();
        } catch (err) {
            console.error('Failed to load project:', err);
            NotificationManager.error('Error loading project file.');
        }
    }

    // Smart Alignment Guides
    handleObjectMoving(e) {
        const obj = e.target;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        const objCenter = obj.getCenterPoint();

        let snappedX = false;
        let snappedY = false;

        this.clearGuidelines();

        // Snap to Vertical Center
        if (Math.abs(objCenter.x - centerX) < this.snapThreshold) {
            obj.set({
                left: centerX - (objCenter.x - obj.left) // Adjust left to match center
            });
            // Recalc center after snap
            objCenter.x = centerX;
            this.drawGuideline(centerX, 0, centerX, canvasHeight);
            snappedX = true;
        }

        // Snap to Horizontal Center
        if (Math.abs(objCenter.y - centerY) < this.snapThreshold) {
            obj.set({
                top: centerY - (objCenter.y - obj.top)
            });
            objCenter.y = centerY;
            this.drawGuideline(0, centerY, canvasWidth, centerY);
            snappedY = true;
        }

        if (snappedX || snappedY) {
            obj.setCoords();
        }
    }

    drawGuideline(x1, y1, x2, y2) {
        const line = new Line([x1, y1, x2, y2], {
            stroke: '#ff0077',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            strokeDashArray: [4, 4],
            opacity: 0.8
        });
        this.guidelines.push(line);
        this.canvas.add(line);
        this.canvas.requestRenderAll();
    }

    clearGuidelines() {
        if (this.guidelines.length) {
            this.guidelines.forEach(line => this.canvas.remove(line));
            this.guidelines = [];
            this.canvas.requestRenderAll();
        }
    }
}
