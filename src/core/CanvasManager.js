import { Canvas, IText, FabricImage, Gradient, loadSVGFromURL, loadSVGFromString, filters, Group, Line, Rect, Pattern, util, PencilBrush, ActiveSelection } from 'fabric';
import { createShape } from '../config/shapeConfig.js';
// ... imports

import { HistoryManager } from './HistoryManager.js';
import { NotificationManager } from '../ui/NotificationManager.js';
import { CanvasViewport } from './CanvasViewport.js';
import { CanvasEvents } from './CanvasEvents.js';

export class CanvasManager {
    constructor(canvasId, options = {}) {
        this.canvas = new Canvas(canvasId, {
            // Initial size, will be auto-resized by viewport
            width: 800,
            height: 600,
            backgroundColor: '#18191b', // Dark background for infinite canvas
            ...options
        });

        // Logical Page Dimensions
        this.originalWidth = 800;
        this.originalHeight = 600;

        this.history = new HistoryManager(this.canvas);

        // Setup Workspace (The Page)
        this.initWorkspace();

        // Modules
        this.viewport = new CanvasViewport(this);
        this.events = new CanvasEvents(this);

        // Smart Guides State
        this.snapThreshold = 10;
        this.guidelines = [];

        this.clipboard = null;

        // Initial Fit (delegated to viewport)
        setTimeout(() => this.fitToScreen(), 100);
    }

    // Drawing Mode Support
    enableDrawingMode() {
        if (!this.canvas) return;
        this.canvas.isDrawingMode = true;
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();

        if (!this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
        }

        // Defaults
        this.canvas.freeDrawingBrush.width = 5;
        this.canvas.freeDrawingBrush.color = '#000000';
    }

    disableDrawingMode() {
        if (!this.canvas) return;
        this.canvas.isDrawingMode = false;
    }

    setBrushColor(color) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.color = color;
        }
    }

    setBrushWidth(width) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.width = parseInt(width, 10);
        }
    }

    initWorkspace() {
        this.workspace = new Rect({
            left: 0,
            top: 0,
            width: this.originalWidth,
            height: this.originalHeight,
            fill: '#ffffff', // Default Page Color
            selectable: false,
            evented: true, // Allow catching clicks
            hoverCursor: 'default',
            moveCursor: 'default',
            name: 'Background', // Display name for Layers Panel
            stroke: '#cccccc', // Optional border
            strokeWidth: 1,
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                blur: 10,
                offsetX: 0,
                offsetY: 5
            }
        });
        this.canvas.add(this.workspace);
        this.canvas.sendObjectToBack(this.workspace);

        // Ensure it stays at back?
        this.canvas.on('object:added', (e) => {
            if (e.target !== this.workspace) {
                this.canvas.sendObjectToBack(this.workspace);
            }
        });
    }

    // Event Helper (Proxy for UI)
    onSelectionChange(callback) {
        this.selectionCallback = callback;
    }

    onZoomChange(callback) {
        this.viewport.onZoomChange(callback);
    }

    // Proxy Methods for Viewport
    setZoom(value) { this.viewport.setZoom(value); }
    zoomIn() { this.viewport.zoomIn(); }
    zoomOut() { this.viewport.zoomOut(); }
    resetZoom() { this.viewport.resetZoom(); }
    fitToScreen() { this.viewport.fitToScreen(); }
    resize(width, height) { this.viewport.resizePage(width, height); }
    toggleHandMode() { return this.viewport.toggleHandMode(); }

    // Logic for Object Manipulation (Kept here or could be moved to ObjectManager)

    getActiveObject() {
        return this.canvas.getActiveObject();
    }

    toggleGrid() {
        if (this.gridObject) {
            this.canvas.remove(this.gridObject);
            this.gridObject = null;
            this.canvas.requestRenderAll();
            return false;
        }

        // Create Grid Pattern
        const gridSize = 50;
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = gridSize;
        patternCanvas.height = gridSize;
        const pCtx = patternCanvas.getContext('2d');

        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        pCtx.lineWidth = 1;
        pCtx.beginPath();
        pCtx.moveTo(0.5, 0);
        pCtx.lineTo(0.5, gridSize);
        pCtx.moveTo(0, 0.5);
        pCtx.lineTo(gridSize, 0.5);
        pCtx.stroke();

        const pattern = new Pattern({
            source: patternCanvas,
            repeat: 'repeat'
        });

        // ...

        // Create a Rect that covers the workspace
        // We use the same dimensions as the workspace
        const gridRect = new Rect({
            left: 0,
            top: 0,
            width: this.originalWidth,
            height: this.originalHeight,
            fill: pattern,
            selectable: false,
            evented: false,
            excludeFromExport: true
        });

        this.gridObject = gridRect;
        this.canvas.add(gridRect);

        // Move to just above workspace
        if (this.workspace) {
            const wsIndex = this.canvas.getObjects().indexOf(this.workspace);
            this.canvas.moveObjectTo(gridRect, wsIndex + 1);
        } else {
            this.canvas.sendObjectToBack(gridRect);
        }

        this.canvas.requestRenderAll();
        return true;
    }

    // Snapping Logic (to be called from CanvasEvents or bound here)
    // Actually, CanvasEvents should call this or we bind it in init.
    // Let's add it to initWorkspace or a new bindEvents method if simpler.
    // For now, let's assume CanvasEvents handles 'object:moving' and we might need to hook into it.
    // But CanvasEvents.js is separate. Let's look at CanvasEvents.js later.
    // For now, I'll expose a snapToGrid method.

    snapToGrid(target) {
        if (!this.gridObject) return;

        const gridSize = 50;
        const threshold = 10;

        const left = Math.round(target.left / gridSize) * gridSize;
        const top = Math.round(target.top / gridSize) * gridSize;

        if (Math.abs(target.left - left) < threshold) {
            target.set('left', left);
        }
        if (Math.abs(target.top - top) < threshold) {
            target.set('top', top);
        }
    }

    addGuide(axis, pos) {
        let guide;
        if (axis === 'horizontal') {
            guide = new Line([0, 0, this.originalWidth, 0], {
                top: pos,
                left: 0,
                stroke: 'cyan',
                strokeDashArray: [4, 4],
                strokeWidth: 1,
                selectable: true,
                evented: true,
                lockMovementX: true,
                lockMovementY: false,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: false,
                hasBorders: false,
                id: 'guide',
                excludeFromExport: true,
                hoverCursor: 'ns-resize',
                moveCursor: 'ns-resize',
                // Keep length dynamic or fixed to page? Fixed to page is standard.
                width: this.originalWidth
            });
        } else {
            guide = new Line([0, 0, 0, this.originalHeight], {
                top: 0,
                left: pos,
                stroke: 'cyan',
                strokeDashArray: [4, 4],
                strokeWidth: 1,
                selectable: true,
                evented: true,
                lockMovementX: false,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: false,
                hasBorders: false,
                id: 'guide',
                excludeFromExport: true,
                hoverCursor: 'ew-resize',
                moveCursor: 'ew-resize',
                height: this.originalHeight
            });
        }

        this.canvas.add(guide);
        this.canvas.bringObjectToFront(guide);
        this.canvas.setActiveObject(guide);
        this.canvas.requestRenderAll();
        return guide;
    }

    // ... existing methods ...

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

    // Smart Guides Logic (Simplified/Placeholder as in original)
    handleObjectMoving(e) {
        const target = e.target;
        const canvas = this.canvas;
        const w = this.originalWidth;
        const h = this.originalHeight;
        const snapDist = this.snapThreshold || 10;

        // Clear previous lines
        this.clearGuidelines();

        // Target Dimensions
        const tLeft = target.left;
        const tTop = target.top;
        const tWidth = target.getScaledWidth();
        const tHeight = target.getScaledHeight();
        const tCenterX = tLeft + tWidth / 2;
        const tCenterY = tTop + tHeight / 2;
        const tRight = tLeft + tWidth;
        const tBottom = tTop + tHeight;

        let vLine = null;
        let hLine = null;

        // --- Vertical Snapping (X-axis) ---
        // 1. Center of Page
        if (Math.abs(tCenterX - w / 2) < snapDist) {
            target.set({ left: w / 2 - tWidth / 2 });
            vLine = w / 2;
        }

        // 2. Snap to other objects
        if (!vLine) {
            canvas.getObjects().forEach(obj => {
                if (obj === target || obj === this.workspace || !obj.visible) return;

                // SPECIAL HANDLER FOR RULER GUIDES
                if (obj.id === 'guide') {
                    // Vertical Guide (moves X)
                    if (obj.lockMovementY) {
                        const gX = obj.left;
                        if (Math.abs(tLeft - gX) < snapDist) { target.set({ left: gX }); vLine = gX; }
                        else if (Math.abs(tRight - gX) < snapDist) { target.set({ left: gX - tWidth }); vLine = gX; }
                        else if (Math.abs(tCenterX - gX) < snapDist) { target.set({ left: gX - tWidth / 2 }); vLine = gX; }
                    }
                    return;
                }

                const oLeft = obj.left;
                const oWidth = obj.getScaledWidth();
                const oCenterX = oLeft + oWidth / 2;
                const oRight = oLeft + oWidth;

                // Snap Centers
                if (Math.abs(tCenterX - oCenterX) < snapDist) {
                    target.set({ left: oCenterX - tWidth / 2 });
                    vLine = oCenterX;
                }
                // Snap Left to Left
                else if (Math.abs(tLeft - oLeft) < snapDist) {
                    target.set({ left: oLeft });
                    vLine = oLeft;
                }
                // Snap Right to Right
                else if (Math.abs(tRight - oRight) < snapDist) {
                    target.set({ left: oRight - tWidth });
                    vLine = oRight;
                }
                // Snap Left to Right
                else if (Math.abs(tLeft - oRight) < snapDist) {
                    target.set({ left: oRight });
                    vLine = oRight;
                }
                // Snap Right to Left
                else if (Math.abs(tRight - oLeft) < snapDist) {
                    target.set({ left: oLeft - tWidth });
                    vLine = oLeft;
                }
            });
        }

        // --- Horizontal Snapping (Y-axis) ---
        // 1. Center of Page
        if (Math.abs(tCenterY - h / 2) < snapDist) {
            target.set({ top: h / 2 - tHeight / 2 });
            hLine = h / 2;
        }

        if (!hLine) {
            canvas.getObjects().forEach(obj => {
                if (obj === target || obj === this.workspace || !obj.visible) return;

                // SPECIAL HANDLER FOR RULER GUIDES
                if (obj.id === 'guide') {
                    // Horizontal Guide (moves Y)
                    if (obj.lockMovementX) {
                        const gY = obj.top;
                        if (Math.abs(tTop - gY) < snapDist) { target.set({ top: gY }); hLine = gY; }
                        else if (Math.abs(tBottom - gY) < snapDist) { target.set({ top: gY - tHeight }); hLine = gY; }
                        else if (Math.abs(tCenterY - gY) < snapDist) { target.set({ top: gY - tHeight / 2 }); hLine = gY; }
                    }
                    return;
                }

                const oTop = obj.top;
                const oHeight = obj.getScaledHeight();
                const oCenterY = oTop + oHeight / 2;
                const oBottom = oTop + oHeight;

                // Snap Centers
                if (Math.abs(tCenterY - oCenterY) < snapDist) {
                    target.set({ top: oCenterY - tHeight / 2 });
                    hLine = oCenterY;
                }
                // Snap Top to Top
                else if (Math.abs(tTop - oTop) < snapDist) {
                    target.set({ top: oTop });
                    hLine = oTop;
                }
                // Snap Bottom to Bottom
                else if (Math.abs(tBottom - oBottom) < snapDist) {
                    target.set({ top: oBottom - tHeight });
                    hLine = oBottom;
                }
                // Snap Top to Bottom
                else if (Math.abs(tTop - oBottom) < snapDist) {
                    target.set({ top: oBottom });
                    hLine = oBottom;
                }
                // Snap Bottom to Top
                else if (Math.abs(tBottom - oTop) < snapDist) {
                    target.set({ top: oTop - tHeight });
                    hLine = oTop;
                }
            });
        }

        // --- Draw Guidelines ---
        if (vLine !== null) {
            this.drawVerticalLine(vLine);
        }
        if (hLine !== null) {
            this.drawHorizontalLine(hLine);
        }
    }

    clearGuidelines() {
        // Remove lines with specific ID or property
        this.canvas.getObjects('line').forEach(obj => {
            if (obj.isSmartGuide) {
                this.canvas.remove(obj);
            }
        });
        this.canvas.requestRenderAll();
    }

    drawVerticalLine(x) {
        this.drawGuideLine([x, 0, x, this.originalHeight]); // Limit to page height or canvas height?
        // Using big coords to be safe across canvas
        // const h = this.canvas.height / this.canvas.getZoom(); // Rough calculation to span screen
        // this.drawGuideLine([x, -10000, x, 10000]); 
    }

    drawHorizontalLine(y) {
        this.drawGuideLine([0, y, this.originalWidth, y]);
        // this.drawGuideLine([-10000, y, 10000, y]);
    }

    drawGuideLine(coords) {
        const line = new Line(coords, {
            stroke: 'red',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            strokeDashArray: [4, 4],
            isSmartGuide: true, // Tag for removal
            excludeFromExport: true
        });
        this.canvas.add(line);
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
        if (!active || (active.type !== 'activeSelection' && active.type !== 'activeselection')) return;

        // Manual grouping for Fabric 6+ where toGroup might be missing
        const objects = active.getObjects();
        this.canvas.discardActiveObject();
        objects.forEach((obj) => {
            this.canvas.remove(obj);
        });

        const group = new Group(objects);
        this.canvas.add(group);
        this.canvas.setActiveObject(group);

        this.canvas.requestRenderAll();
        this.history.saveState();
        NotificationManager.success('Grouped objects');
    }

    ungroup() {
        const active = this.getActiveObject();
        if (!active || active.type !== 'group') return;

        // Manual ungrouping if toActiveSelection is missing
        const objects = active.getObjects();
        this.canvas.remove(active);

        // Restore objects to canvas
        // We need to clone or just re-add? getObjects returns refs but they have group-relative coords.
        // Fabric's toActiveSelection handles matrix decomposition.
        // If we lack that, we might have issues. 
        // Let's try explicit active.toActiveSelection() first? 
        // User error was only about toGroup.
        // But let's be safe. Fabric 6 typically uses `active.destroy()` or `active.getObjects()` then re-add.
        // However, restoring transforms is hard manually.
        // Let's rely on `active.toActiveSelection()` if it exists, otherwise warn or implement robust logic.
        // But since we are editing, let's just assume if toGroup is gone, toActiveSelection might be changed.

        // Actually, looking at docs, toGroup() IS Deprecated in v6. Method is now `group.toActiveSelection()` (exists?) 
        // No, `activeSelection.toGroup()` was removed. 
        // use `new fabric.Group(objects)` ? Yes.

        // For Ungroup: `group.toActiveSelection()`? 
        if (typeof active.toActiveSelection === 'function') {
            active.toActiveSelection();
        } else {
            // Fallback or new standard:
            // 1. Get objects (they are in group coords)
            // 2. Destroy group (restores objects to canvas?)
            // No, `group.destroy()` might kill them.
            // `group.removeWithUpdate(obj)`?

            // Simplest Fabric 6 ungroup:
            active.getObjects().forEach((obj) => {
                active.removeWithUpdate(obj); // This updates obj coords to global?
                this.canvas.add(obj);
            });
            this.canvas.remove(active);

            // Select them
            if (objects.length > 0) {
                const sel = new ActiveSelection(objects, { canvas: this.canvas });
                this.canvas.setActiveObject(sel);
            }
        }

        this.canvas.requestRenderAll();
        this.history.saveState();
        NotificationManager.success('Ungrouped objects');
    }

    setBackgroundColor(color) {
        // Update Workspace Color instead of Canvas
        if (this.workspace) {
            this.workspace.set('fill', color);
            this.canvas.requestRenderAll();
        }
    }

    setBackgroundGradient(start, end, direction, width, height) {
        const w = this.originalWidth;
        const h = this.originalHeight;

        let coords = { x1: 0, y1: 0, x2: w, y2: 0 };
        if (direction === 'vertical') coords = { x1: 0, y1: 0, x2: 0, y2: h };
        if (direction === 'diagonal') coords = { x1: 0, y1: 0, x2: w, y2: h };

        const gradient = new Gradient({
            type: 'linear',
            coords: coords,
            colorStops: [
                { offset: 0, color: start },
                { offset: 1, color: end }
            ]
        });

        if (this.workspace) {
            this.workspace.set('fill', gradient);
            this.canvas.requestRenderAll();
        }
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

    async addImage(dataUrl, options = {}) {
        try {
            const img = await FabricImage.fromURL(dataUrl);
            if (img.width > this.originalWidth) {
                img.scaleToWidth(this.originalWidth / 2);
            }
            // Apply options
            if (options.fill) {
                img.set({ tint: options.fill });
            }

            this.canvas.add(img);
            // Manual center since centerObject uses physical dimensions
            img.set({
                left: this.originalWidth / 2,
                top: this.originalHeight / 2,
                originX: 'center',
                originY: 'center'
            });
            this.canvas.setActiveObject(img);
            this.canvas.requestRenderAll();
        } catch (err) {
            console.error('Error loading image:', err);
        }
    }

    addShape(type, options = {}) {
        const opts = { left: 100, top: 100, ...options };
        const shape = createShape(type, opts);

        if (shape) {
            this.canvas.add(shape);
            this.canvas.setActiveObject(shape);
            this.canvas.requestRenderAll();
        }
    }

    // Advanced Controls & Alignments
    async addSVG(url, options = {}) {
        try {
            console.log('Attempting to load SVG from:', url);
            const result = await loadSVGFromURL(url);
            console.log('SVG Loaded result:', result);
            const { objects, opts } = result;

            if (objects && objects.length > 0) {
                const group = new Group(objects, {
                    ...opts,
                    ...options, // Merge passed options
                    left: 100,
                    top: 100
                });

                // Apply fill if provided
                if (options.fill) {
                    const setFillRecursive = (objs) => {
                        objs.forEach(obj => {
                            if (obj.type === 'group') {
                                setFillRecursive(obj._objects);
                            } else if (obj.set) {
                                obj.set('fill', options.fill);
                            }
                        });
                    };
                    if (group._objects) setFillRecursive(group._objects);
                    group.set('fill', options.fill);
                }

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

    async addSVGString(svgStr, options = {}) {
        try {
            const result = await loadSVGFromString(svgStr);
            const { objects, opts } = result;

            if (objects && objects.length > 0) {
                const group = new Group(objects, {
                    ...opts,
                    ...options,
                    left: 100,
                    top: 100
                });

                if (options.fill) {
                    const setFillRecursive = (objs) => {
                        objs.forEach(obj => {
                            if (obj.type === 'group') {
                                setFillRecursive(obj._objects);
                            } else if (obj.set) {
                                obj.set('fill', options.fill);
                                if (obj.type === 'path') obj.set('stroke', options.fill); // Icons often use stroke or fill
                            }
                        });
                    };
                    if (group._objects) setFillRecursive(group._objects);
                    group.set('fill', options.fill);
                }

                this.canvas.add(group);
                this.canvas.setActiveObject(group);
                this.canvas.requestRenderAll();
            }
        } catch (err) {
            console.error('SVG String Load Error', err);
        }
    }

    updateActiveObject(prop, value) {
        const active = this.getActiveObject();
        if (!active) return;

        if (prop.startsWith('shadow.')) {
            // Handle Shadow Properties
            const shadowProp = prop.split('.')[1]; // color, blur, offsetX, offsetY
            let shadow = active.shadow;

            // If no shadow exists, create one with defaults
            if (!shadow) {
                active.set('shadow', {
                    color: '#000000',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 5
                });
                shadow = active.shadow;
            }

            // Update specific property
            // Note: Fabric.js Shadow object properties might be read-only if not using set? 
            // Better to clone or set specifically.
            if (active.shadow instanceof Object) { // Start with object
                // If value is null/empty for color, remove shadow?
                if (shadowProp === 'color' && !value) {
                    active.set('shadow', null);
                } else {
                    active.shadow[shadowProp] = value;
                }
            } else {
                // If it was a string or something else, reset
                active.set('shadow', {
                    color: '#000000',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 5
                });
                active.shadow[shadowProp] = value;
            }

            // Re-assign to ensure invalidation (sometimes needed for fabric)
            active.set('shadow', active.shadow);
        }
        else if (prop.startsWith('filter.')) {
            // Handle Image Filters
            // prop: filter.brightness / filter.contrast / filter.blur
            if (active.type === 'image' || active instanceof FabricImage) {
                const filterName = prop.split('.')[1];
                let valueNum = parseFloat(value);

                // Apply Filter
                this.applyImageFilter(active, filterName, valueNum);
            }
        }
        else if (prop === 'fill') {
            if (active.type === 'image' || active instanceof FabricImage) {
                active.set({ tint: value });
            } else if (active.type === 'group' || active.type === 'path-group') {
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
                active.set('fill', value);
            } else {
                active.set('fill', value);
            }
        } else {
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
            const w = this.originalWidth;
            const h = this.originalHeight;
            const objW = activeObj.getScaledWidth();
            const objH = activeObj.getScaledHeight();

            switch (position) {
                case 'left':
                    if (activeObj.originX === 'center') activeObj.set({ left: objW / 2 });
                    else activeObj.set({ left: 0 });
                    break;
                case 'center':
                    activeObj.set({ left: w / 2 });
                    if (activeObj.originX !== 'center') activeObj.set({ left: w / 2 - objW / 2 });
                    break;
                case 'right':
                    if (activeObj.originX === 'center') activeObj.set({ left: w - objW / 2 });
                    else activeObj.set({ left: w - objW });
                    break;
                case 'top':
                    if (activeObj.originY === 'center') activeObj.set({ top: objH / 2 });
                    else activeObj.set({ top: 0 });
                    break;
                case 'middle':
                    activeObj.set({ top: h / 2 });
                    if (activeObj.originY !== 'center') activeObj.set({ top: h / 2 - objH / 2 });
                    break;
                case 'bottom':
                    if (activeObj.originY === 'center') activeObj.set({ top: h - objH / 2 });
                    else activeObj.set({ top: h - objH });
                    break;
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
        });
        this.canvas.requestRenderAll();
        return shouldLock;
    }

    loadGoogleFont(fontName) {
        if (!fontName) return;

        // standard fonts skip
        const standard = [
            'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Impact',
            'Noto Sans Lao Looped', 'Noto Serif Lao', 'Phetsarath OT', 'Noto Sans Lao'
        ];
        if (standard.some(s => fontName.includes(s))) return;

        // Clean font name (remove single quotes)
        const family = fontName.replace(/['"]/g, '').split(',')[0].trim();
        const id = 'font-css-' + family.replace(/\s+/g, '-').toLowerCase();

        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
            document.head.appendChild(link);

            // Wait for load? Fabric often needs a re-render after font load.
            // We can assume network speed or use a dedicated font loader lib, but simple retry works for now.
            link.onload = () => {
                this.canvas.requestRenderAll();
            };
        }
    }

    setTextStyle(prop, value) {
        const active = this.getActiveObject();
        if (active && active.type === 'i-text') {
            if (prop === 'fontFamily') {
                this.loadGoogleFont(value);
            }
            active.set(prop, value);
            this.canvas.requestRenderAll();
        }
    }

    applyImageFilter(obj, type, value) {
        if (!obj || !obj.filters) return;

        // Fabric filters mapping
        const filterMap = {
            'brightness': 'Brightness',
            'contrast': 'Contrast',
            'blur': 'Blur',
            'saturation': 'Saturation',
            'grayscale': 'Grayscale',
            'sepia': 'Sepia',
            'hue': 'HueRotation',
            'noise': 'Noise',
            'pixelate': 'Pixelate'
        };

        const filterType = filterMap[type];
        if (!filterType) return;

        // Check if filter exists
        let filter = obj.filters.find(f => f.type === filterType);

        if (!filter) {
            // Create new filter
            const FilterClass = filters[filterType];
            if (FilterClass) {
                // Constructor options
                let opts = {};
                if (type === 'blur') opts = { blur: value };
                else if (type === 'pixelate') opts = { blocksize: value };
                else if (type === 'hue') opts = { rotation: value };
                else if (type === 'grayscale' || type === 'sepia') {
                    // Start enabled? These are often toggles or have 1 fixed value in simplified usage
                    // but Fabric allows mixing.
                    // For now, assume simplified toggle/slider if value > 0? 
                    // Or standard standard object init.
                }
                else {
                    opts[type] = value;
                }

                // Some filters like Grayscale don't take value in constructor if they are just on/off,
                // but fabric's Grayscale might have 'mode'? Standard is just new Grayscale().
                // Let's handle generic case:
                filter = new FilterClass(opts);
                obj.filters.push(filter);
            }
        }

        // Update existing (or just created)
        if (filter) {
            if (type === 'blur') filter.blur = value;
            else if (type === 'pixelate') filter.blocksize = value;
            else if (type === 'hue') filter.rotation = value;
            else if (type === 'grayscale' || type === 'sepia') {
                // These don't usually have a slider value in basic Fabric.
                // Assuming the UI sends 0 or 1 for toggle? 
                // Or we can use a "mode" or ignore value if it's just a button.
                // But user might want partial? Fabric Grayscale is absolute.
                // If value is 0, remove it?
                if (value === 0) {
                    const idx = obj.filters.indexOf(filter);
                    if (idx > -1) obj.filters.splice(idx, 1);
                }
            }
            else {
                filter[type] = value;
            }
        }

        obj.applyFilters();
        this.canvas.requestRenderAll();
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
            return active[prop];
        }
    }

    startCropMode(activeObject) {
        activeObject = activeObject || this.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        this.isCropping = true;
        this.cropTarget = activeObject;

        // Hide standard controls
        activeObject.hasControls = false;
        activeObject.hasBorders = false;

        // Disable other interactions? 
        this.canvas.selection = false; // Disable global selection
        this.canvas.discardActiveObject(); // We manage crop rect manually
        this.canvas.requestRenderAll();

        // Create Crop Rect (The overlay)
        // We need a semi-transparent overlay to dim everything else,
        // OR we just put a crop frame on top. 
        // Standard UX: The crop rect represents the visible area.

        // 1. Overlay (Darken) - Optional, maybe complicated for now. 
        // Let's stick to a Crop Frame.

        const w = activeObject.getScaledWidth();
        const h = activeObject.getScaledHeight();
        const left = activeObject.left;
        const top = activeObject.top;

        this.cropRect = new Rect({
            left: left,
            top: top,
            width: w,
            height: h,
            fill: 'rgba(0,0,0,0)',
            stroke: '#ffffff',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#000000',
            borderColor: '#ffffff',
            cornerSize: 12,
            padding: 0,
            cornerStyle: 'circle',
            borderDashArray: [5, 5],
            id: 'crop-ui'
        });

        this.canvas.add(this.cropRect);
        this.canvas.setActiveObject(this.cropRect);
        this.canvas.requestRenderAll();

        // Listen for crop rect changes?
        // We apply crop only when "Apply" is clicked.
    }

    applyCrop() {
        if (!this.isCropping || !this.cropTarget || !this.cropRect) return;

        const img = this.cropTarget;
        const crop = this.cropRect;

        // Calculate Clipping
        // 1. Get relative position of crop rect to image
        // NOTE: If image is rotated, this gets math-heavy. 
        // For simple MVP: Assume rotation 0 or standard usage.
        // Handling rotation requires transforming points.

        // --- Robust Matrix Logic ---
        // 1. Calculate inverted matrix to map global points to image's local space
        const invertedMatrix = util.invertTransform(img.calcTransformMatrix());

        // 2. Get crop top-left in global coords
        const cropLeft = crop.left;
        const cropTop = crop.top;

        // 3. Transform to local space
        const localPoint = util.transformPoint({ x: cropLeft, y: cropTop }, invertedMatrix);

        // 4. Calculate dimensions in local space
        const clipWidth = crop.getScaledWidth() / img.scaleX;
        const clipHeight = crop.getScaledHeight() / img.scaleY;

        // 5. Create clipPath
        const clipRect = new Rect({
            left: localPoint.x,
            top: localPoint.y,
            width: clipWidth,
            height: clipHeight,
            originX: 'left',
            originY: 'top',
        });

        img.clipPath = clipRect;

        // cleanup
        this.cancelCrop();

        // Re-select image
        this.canvas.setActiveObject(img);
        this.canvas.requestRenderAll();
        // Trigger UI update
        if (this.selectionCallback) this.selectionCallback(img);
    }

    async maskObject() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'activeSelection' && active.type !== 'activeselection')) return;

        const objs = active.getObjects();
        if (objs.length !== 2) return;

        // Identify Image and Shape
        let img = objs.find(o => o.type === 'image');
        let shape = objs.find(o => ['rect', 'circle', 'triangle', 'polygon', 'path'].includes(o.type));

        if (!img || !shape) return;

        // 1. Calculate Inverse Matrix of the Image to map global points to local image space
        // Note: activeSelection logic is tricky. The objects inside are relative to the selection group usually?
        // Wait, Fabric v6 activeSelection: getObjects() returns objects with their own transforms relative to canvas 
        // IF we didn't transform the selection itself? 
        // Actually, when in activeSelection, objects usually maintain their own coordinates but are rendered differently.
        // Let's rely on `o.calcTransformMatrix()` which gives global matrix.

        // We need to clone the shape so we don't mess up the original if we wanted to keep it (but we consume it here).
        // Cloning is safer to detach from selection.
        const shapeClone = await shape.clone();

        // 2. Transform Shape to Image's Local Space
        // Logic: LocalPoint = InverseImageMatrix * GlobalPoint
        // We need to transform the entire Object.

        // Get Image Inverse Matrix
        const imgMatrix = img.calcTransformMatrix();
        const imgInverse = util.invertTransform(imgMatrix);

        // Get Shape Global Matrix
        const shapeMatrix = shape.calcTransformMatrix();

        // Combined Matrix: We want Shape -> Canvas -> ImageLocal
        // Result Matrix = ImageInverse * ShapeMatrix
        const finalMatrix = util.multiplyTransformMatrices(imgInverse, shapeMatrix);

        // Apply this matrix to the clone
        // Fabric doesn't have "setMatrix" directly exposed easily for all props, 
        // but `util.qrDecompose` can extract scale/rotate/translate/skew from a matrix.
        const options = util.qrDecompose(finalMatrix);

        shapeClone.set({
            flipX: false,
            flipY: false, // matrices handle flip via scale
            scaleX: options.scaleX,
            scaleY: options.scaleY,
            angle: options.angle,
            skewX: options.skewX,
            skewY: options.skewY,
            left: options.translateX,
            top: options.translateY,
            originX: 'center', // ClipPath is relative to center of object
            originY: 'center',
            absolutePositioned: false // We want it relative to the image
            // Note: qrDecompose returns Center-based transforms? 
            // Fabric util.multiplyTransformMatrices result depends on origins.
            // Standard calcTransformMatrix is from Top-Left or Center? 
            // activeSelection makes it complex.
        });

        // Reset origin of shape to match expected clipPath behavior (centered)
        // If the Matrix logic is correct, the shapeClone is now in Image Local Coordinates (Center relative to Image Center).

        img.clipPath = shapeClone;

        // Remove originals? 
        // We keep the image, remove the shape.
        // And discard selection.
        this.canvas.discardActiveObject();
        this.canvas.remove(shape);

        // Image needs to be re-added? No, it's there.
        img.dirty = true;
        this.canvas.requestRenderAll();

        // Select the masked image
        this.canvas.setActiveObject(img);
    }

    cancelCrop() {
        if (this.cropRect) {
            this.canvas.remove(this.cropRect);
            this.cropRect = null;
        }

        if (this.cropTarget) {
            this.cropTarget.hasControls = true;
            this.cropTarget.hasBorders = true;
            this.cropTarget = null;
        }

        this.isCropping = false;
        this.canvas.selection = true;
        this.canvas.requestRenderAll();

        // Trigger UI update to hide Crop controls (handled via event or selection change)
        if (this.selectionCallback) this.selectionCallback(null);
    }

    exportToImage(filename, quality = 1) {
        // Save current view state
        const originalVPT = this.canvas.viewportTransform.slice();
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;
        // background color hack: ensure it's rendered if it's not transparent
        const originalBg = this.canvas.backgroundColor;

        try {
            // Reset to logical dimensions for the export
            this.canvas.setWidth(this.originalWidth);
            this.canvas.setHeight(this.originalHeight);
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            const dataURL = this.canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: quality,
                left: 0,
                top: 0,
                width: this.originalWidth,
                height: this.originalHeight,
                enableRetinaScaling: true
            });

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            // Always restore dimensions and view
            this.canvas.setWidth(originalWidth);
            this.canvas.setHeight(originalHeight);
            this.canvas.setViewportTransform(originalVPT);
            this.canvas.backgroundColor = originalBg;
            this.canvas.requestRenderAll();
        }
    }

    exportToSVG(filename) {
        const originalVPT = this.canvas.viewportTransform.slice();
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;

        try {
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            this.canvas.setWidth(this.originalWidth);
            this.canvas.setHeight(this.originalHeight);

            const svg = this.canvas.toSVG({
                viewBox: {
                    x: 0,
                    y: 0,
                    width: this.originalWidth,
                    height: this.originalHeight
                },
                width: this.originalWidth,
                height: this.originalHeight
            });

            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${filename}.svg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error('SVG Export failed:', e);
        } finally {
            this.canvas.setWidth(originalWidth);
            this.canvas.setHeight(originalHeight);
            this.canvas.setViewportTransform(originalVPT);
            this.canvas.requestRenderAll();
        }
    }

    getCanvasDataURL(quality = 1) {
        const originalVPT = this.canvas.viewportTransform.slice();
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;

        try {
            this.canvas.setWidth(this.originalWidth);
            this.canvas.setHeight(this.originalHeight);
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            const dataURL = this.canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: quality,
                left: 0,
                top: 0,
                width: this.originalWidth,
                height: this.originalHeight,
                enableRetinaScaling: true
            });

            return dataURL;
        } finally {
            this.canvas.setWidth(originalWidth);
            this.canvas.setHeight(originalHeight);
            this.canvas.setViewportTransform(originalVPT);
            this.canvas.requestRenderAll();
        }
    }

    async loadTemplate(jsonObj) {
        if (!jsonObj) {
            // Clear / Reset
            this.canvas.clear();
            // Reset Workspace Color (this is what sets the bg)
            // this.canvas.setBackgroundColor('#ff0000', () => { }); // No, we use workspace object
            this.resize(800, 600); // Default Reset Size
            this.initWorkspace();
            this.history.clear(); // Clear history for new project
            return;
        }

        try {
            if (jsonObj.width && jsonObj.height) {
                this.resize(jsonObj.width, jsonObj.height);
            }

            await this.canvas.loadFromJSON(jsonObj);

            // Re-find workspace if it was serialized
            this.workspace = this.canvas.getObjects().find(o => o.width === this.originalWidth && o.height === this.originalHeight && !o.selectable);

            if (!this.workspace) {
                this.initWorkspace();
            } else {
                this.canvas.sendObjectToBack(this.workspace);
            }

            this.canvas.requestRenderAll();
            this.history.clear();
            NotificationManager.success('Template loaded successfully');

        } catch (err) {
            console.error('Error loading template:', err);
            NotificationManager.error('Failed to load template');
        }
    }

    saveProject() {
        const json = this.canvas.toJSON();
        json.width = this.originalWidth;
        json.height = this.originalHeight;
        return json;
    }
}
