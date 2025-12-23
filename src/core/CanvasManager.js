import { Canvas, Gradient, Rect, util, PencilBrush, FabricImage, ActiveSelection, loadSVGFromString, IText } from 'fabric';
import { jsPDF } from 'jspdf';
import { getCropControls } from './CropControls.js';
// ... imports


import { NotificationManager } from './NotificationManager.js';
import TextExtractionService from '../services/TextExtractionService.js';
import { CanvasViewport } from './CanvasViewport.js';
import { CanvasEvents } from './CanvasEvents.js';
import { LayoutManager } from './LayoutManager.js';
import { ClipboardManager } from './ClipboardManager.js';
import { GuideManager } from './GuideManager.js';
import { ObjectManager } from './managers/ObjectManager.js';
import { ShapeManager } from './managers/ShapeManager.js';
import { FilterManager } from './managers/FilterManager.js';
import { FontManager } from './managers/FontManager.js';
import { HistoryManager } from './managers/HistoryManager.js';
import VectorizationService from '../services/VectorizationService.js';
import ColorService from '../services/ColorService.js';
import UpscalingService from '../services/UpscalingService.js';

export class CanvasManager {
    constructor(canvasId, options = {}) {
        this.canvas = new Canvas(canvasId, {
            // Initial size, will be auto-resized by viewport
            width: 800,
            height: 600,
            backgroundColor: '#18191b', // Dark background for infinite canvas
            preserveObjectStacking: true,
            ...options
        });

        // Logical Page Dimensions
        this.originalWidth = 800;
        this.originalHeight = 600;

        // Properties to persist
        this.projectProperties = ['name', 'id', 'selectable', 'evented', 'subTargetCheck', 'interactive', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation'];

        // Setup Workspace (The Page)
        this.initWorkspace();



        // Modules
        this.viewport = new CanvasViewport(this);
        this.events = new CanvasEvents(this);
        this.layoutManager = new LayoutManager(this);
        this.clipboardManager = new ClipboardManager(this);
        this.guideManager = new GuideManager(this);
        this.objectManager = new ObjectManager(this);
        this.shapeManager = new ShapeManager(this);
        this.filterManager = new FilterManager(this);
        this.filterManager = new FilterManager(this);
        this.fontManager = new FontManager(this);
        this.historyManager = new HistoryManager(this);



        // Initial Fit (delegated to viewport)
        setTimeout(() => this.fitToScreen(), 100);

        // Smart Frames (Drag & Drop Image into Shape)
        this.initSmartFrames();
    }

    initSmartFrames() {
        if (!this.canvas) return;

        // Highlight shape when dragging image over it
        this.canvas.on('object:moving', (e) => {
            const active = e.target;
            if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) return;

            // Reset previous highlights
            this.canvas.getObjects().forEach(obj => {
                if (obj.isSmartFrameHighlight) {
                    obj.set('opacity', obj.originalOpacity || 1);
                    obj.set('stroke', obj.originalStroke || null);
                    obj.set('strokeWidth', obj.originalStrokeWidth || 0);
                    delete obj.isSmartFrameHighlight;
                }
            });

            // Find overlapping shape
            const shapes = this.canvas.getObjects().filter(obj =>
                ['rect', 'circle', 'triangle', 'polygon', 'path'].includes(obj.type) &&
                obj !== active &&
                obj !== this.workspace &&
                obj.visible
            );

            const activeCenter = active.getCenterPoint();
            const hitShape = shapes.find(shape => shape.containsPoint(activeCenter));

            if (hitShape) {
                // Highlight
                if (!hitShape.isSmartFrameHighlight) {
                    hitShape.originalOpacity = hitShape.opacity;
                    hitShape.originalStroke = hitShape.stroke;
                    hitShape.originalStrokeWidth = hitShape.strokeWidth;

                    hitShape.isSmartFrameHighlight = true;
                    hitShape.set({
                        opacity: 0.8,
                        stroke: '#3498db',
                        strokeWidth: 3
                    });
                    this.canvas.requestRenderAll();
                }
            }
        });

        // Apply ClipPath on drop
        this.canvas.on('object:modified', (e) => {
            const active = e.target;
            // Only trigger if it was a move action (not scale/rotate)
            if (e.action !== 'drag' || !active || (active.type !== 'image' && active.type !== 'fabric-image')) return;

            // Check if we dropped onto a highlighted smart frame
            const shapes = this.canvas.getObjects();
            const targetShape = shapes.find(obj => obj.isSmartFrameHighlight);

            if (targetShape) {
                // Restore shape style first
                targetShape.set({
                    opacity: targetShape.originalOpacity || 1,
                    stroke: targetShape.originalStroke || null,
                    strokeWidth: targetShape.originalStrokeWidth || 0
                });
                delete targetShape.isSmartFrameHighlight;

                // CONFIRMATION (Optional, but good for UX)
                // For now, auto-apply
                this.clipImageToShape(active, targetShape);
            }
        });
    }

    async clipImageToShape(img, shape) {
        if (!img || !shape) return;

        try {
            // 1. Clone the shape to serve as the ClipPath
            const clipPath = await shape.clone();

            // 2. Configure ClipPath to be RELATIVE (moves with image)
            // Note: We will adjust scale/position relative to the image later
            clipPath.set({
                absolutePositioned: false,
                originX: 'center',
                originY: 'center',
                left: 0,
                top: 0,
                strokeWidth: 0,
                stroke: null,
                opacity: 1,
                fill: 'black'
            });

            // 3. Center Image on Shape
            const shapeCenter = shape.getCenterPoint();

            // Calculate scale to cover (Aspect Fill)
            const imgRatio = img.width / img.height;
            const shapeRatio = shape.width / shape.height; // Rough approximation for bounding box

            // Getting precise aspect fill for arbitrary shapes is complex, 
            // but matching bounding box is a good start.
            let scaleX = shape.width * shape.scaleX / img.width;
            let scaleY = shape.height * shape.scaleY / img.height;
            let scale = Math.max(scaleX, scaleY);

            img.set({
                scaleX: scale,
                scaleY: scale,
                left: shapeCenter.x,
                top: shapeCenter.y,
                originY: 'center',
                angle: 0
            });
            img.setCoords();

            // 4. Calculate relative scale for the clipPath
            // clipScale = shapeScale / imgScale
            const relativeScaleX = shape.scaleX / img.scaleX;
            const relativeScaleY = shape.scaleY / img.scaleY;
            const relativeAngle = shape.angle - img.angle;

            clipPath.set({
                scaleX: relativeScaleX,
                scaleY: relativeScaleY,
                angle: relativeAngle
            });

            // 5. Apply ClipPath
            img.set('clipPath', clipPath);
            img.set('dirty', true);

            // 6. Remove original shape
            this.canvas.remove(shape);

            this.canvas.requestRenderAll();
            this.historyManager.saveState('Smart Frame');
            NotificationManager.success("Image snapped to frame!");

        } catch (err) {
            console.error("Smart Frame operations failed:", err);
        }
    }

    dispose() {
        if (this.events && typeof this.events.dispose === 'function') {
            this.events.dispose();
        }
        if (this.viewport && typeof this.viewport.dispose === 'function') {
            this.viewport.dispose();
        }
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
    }

    async duplicateActiveObject() {
        await this.clipboardManager.duplicate();
    }

    toggleLockActiveObject() {
        this.objectManager.toggleLock();
    }

    getActiveObject() {
        if (!this.canvas) return null;
        return this.canvas.getActiveObject();
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

        const workspace = new Rect({
            left: 0,
            top: 0,
            width: this.originalWidth,
            height: this.originalHeight,
            fill: '#ffffff', // Default Page Color
            selectable: false,
            evented: false, // Core change: Pass clicks to canvas
            stroke: '#cccccc',
            strokeWidth: 1,
            originX: 'left',
            originY: 'top',
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                blur: 10,
                offsetX: 0,
                offsetY: 5
            }
        });

        // Native Background Implementation
        // Native Background Implementation
        this.canvas.backgroundImage = workspace;
        this.canvas.requestRenderAll();

        this.canvas.backgroundColor = '#18191b'; // Infinite void color
        this.workspace = workspace; // Keep reference for LayoutManager/Export





    }

    setBackgroundColor(color) {
        if (this.workspace) {
            this.workspace.set('fill', color);
            this.canvas.requestRenderAll();
        }
    }

    // Event Helper (Proxy for UI)
    onSelectionChange(callback) {
        this.selectionCallback = callback;
    }

    onZoomChange(callback) {
        this.viewport.onZoomChange(callback);
    }

    updateActiveObject(prop, value) {
        const active = this.getActiveObject();
        if (!active) return;

        if (prop.startsWith('shadow.')) {
            const shadowProp = prop.split('.')[1];
            let shadow = active.shadow;
            if (!shadow) {
                active.set('shadow', { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 });
                shadow = active.shadow;
            }
            if (active.shadow instanceof Object) {
                if (shadowProp === 'color' && !value) {
                    active.set('shadow', null);
                } else {
                    active.shadow[shadowProp] = value;
                }
            }
            active.set('shadow', active.shadow);
        } else if (prop.startsWith('filter.')) {
            if (active.type === 'image' || active instanceof FabricImage) {
                const filterName = prop.split('.')[1];
                this.filterManager.applyImageFilter(active, filterName, parseFloat(value));
            }
        } else if (prop === 'fill') {
            if (active.type === 'image' || active instanceof FabricImage) {
                // For images, 'fill' acts as a Tint (BlendColor filter)
                this.filterManager.applyImageFilter(active, 'tint', value);
            } else if (active.type === 'group' || active.type === 'path-group') {
                const setFillRecursive = (objects) => {
                    objects.forEach(obj => {
                        if (obj.type === 'group') setFillRecursive(obj._objects);
                        else if (obj.set) obj.set('fill', value);
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

    // --- LAYERING ---
    flipActiveObject(direction) {
        this.objectManager.flip(direction);
    }

    layerActiveObject(direction) {
        this.objectManager.layer(direction);
    }

    bringForward() { this.objectManager.bringForward(); }
    sendBackward() { this.objectManager.sendBackward(); }
    bringToFront() { this.objectManager.bringToFront(); }
    bringToFront() { this.objectManager.bringToFront(); }
    sendToBack() { this.objectManager.sendToBack(); }

    async undo() { await this.historyManager.undo(); }
    async redo() { await this.historyManager.redo(); }

    // Proxy Methods for Viewport
    setZoom(value) { this.viewport.setZoom(value); }
    zoomIn() { this.viewport.zoomIn(); }
    zoomOut() { this.viewport.zoomOut(); }
    resetZoom() { this.viewport.resetZoom(); }
    fitToScreen() { this.viewport.fitToScreen(); }
    resize(width, height) { this.viewport.resizePage(width, height); }
    toggleHandMode() { return this.viewport.toggleHandMode(); }

    // Logic for Object Manipulation (Kept here or could be moved to ObjectManager)

    // --- ALIGNMENT & DISTRIBUTION ---
    alignObjects(type, forceWorkspace = false) {
        this.layoutManager.align(type, forceWorkspace);
    }

    distributeObjects(direction) {
        console.log(`[CanvasManager] Proxying distributeObjects: ${direction}`);
        this.layoutManager.distribute(direction);
    }

    toggleGrid() {
        return this.guideManager.toggleGrid();
    }

    snapToGrid(target) {
        this.guideManager.snapToGrid(target);
    }

    addGuide(axis, pos) {
        return this.guideManager.addGuide(axis, pos);
    }

    handleObjectMoving(e) {
        this.guideManager.handleObjectMoving(e);
    }

    clearGuidelines() {
        this.guideManager.clearGuidelines();
    }

    // ... existing methods ...

    removeActiveObject() {
        this.objectManager.remove();
    }


    async copy() {
        await this.clipboardManager.copy();
    }

    async paste() {
        await this.clipboardManager.paste();
    }

    group() {
        this.objectManager.group();
    }

    async ungroup() {
        await this.objectManager.ungroup();
    }

    selectAll() {
        const objects = this.canvas.getObjects().filter(obj =>
            obj.name !== 'Background' &&
            obj !== this.workspace &&
            obj.selectable &&
            obj.evented &&
            !obj.excludeFromExport
        );

        if (objects.length > 0) {
            this.canvas.discardActiveObject();
            const sel = new ActiveSelection(objects, {
                canvas: this.canvas
            });
            this.canvas.setActiveObject(sel);
            this.canvas.requestRenderAll();
        }
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
        this.shapeManager.addText(text, options);
    }

    async addImage(dataUrl, options = {}) {
        await this.shapeManager.addImage(dataUrl, options);
    }

    /**
     * Replaces the source of an image object with a new blob/url.
     * Preserves dimensions and position.
     */
    async replaceImage(activeObject, newSrc) {
        if (!activeObject || (activeObject.type !== 'image' && activeObject.type !== 'fabric-image')) return;

        try {
            // 1. Load new image
            const newImgElement = await util.loadImage(newSrc);

            // 2. Update source
            activeObject.setElement(newImgElement);

            activeObject.setCoords();
            this.canvas.requestRenderAll();
        } catch (err) {
            console.error('Failed to replace image:', err);
        }
    }

    /**
     * Vectorizes the currently active image and replaces it with a path-based group.
     */
    async vectorizeActiveImage() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) {
            NotificationManager.warning("Select an image to vectorize.");
            return;
        }

        NotificationManager.info("Vectorizing image. This may take a moment...");

        try {
            const src = active.getSrc();
            // 1. Trace image to SVG string
            const svgString = await VectorizationService.trace(src);

            // 2. Load SVG string into Fabric objects (Fabric 6 uses top-level async functions)
            const { objects, options } = await loadSVGFromString(svgString);
            const group = util.groupSVGElements(objects, options);

            // 3. Position and scale based on original image
            const originalMatrix = active.calcTransformMatrix();
            const qr = util.qrDecompose(originalMatrix);

            // Match original transform as closely as possible
            group.set({
                left: qr.translateX,
                top: qr.translateY,
                angle: qr.angle,
                scaleX: qr.scaleX * (active.width / group.width),
                scaleY: qr.scaleY * (active.height / group.height),
                flipX: qr.flipX,
                flipY: qr.flipY,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true
            });

            // 4. Swap objects
            this.canvas.add(group);
            this.canvas.remove(active);
            this.canvas.setActiveObject(group);
            this.canvas.requestRenderAll();

            this.historyManager.saveState('Vectorize Image');
            NotificationManager.success("Image vectorized successfully!");
        } catch (error) {
            console.error("Vectorization failed:", error);
            NotificationManager.error("Failed to vectorize image.");
        }
    }

    /**
     * Extracts a color palette from the currently active image.
     * @returns {Promise<{dominant: string, palette: string[]}>}
     */
    async extractPaletteFromActiveImage() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) {
            NotificationManager.warning("Select an image to extract colors.");
            return null;
        }

        NotificationManager.info("Extracting color palette...");

        try {
            const src = active.getSrc();
            const result = await ColorService.extractColors(src);
            NotificationManager.success("Colors extracted!");
            return result;
        } catch (error) {
            console.error("Color extraction failed:", error);
            NotificationManager.error("Failed to extract colors.");
            return null;
        }
    }

    /**
     * Upscales the currently active image using AI.
     */
    async upscaleActiveImage() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) {
            NotificationManager.warning("Select an image to enhance.");
            return;
        }

        NotificationManager.info("Enhancing image quality. This may take a minute...");

        try {
            const src = active.getSrc();
            const enhancedSrc = await UpscalingService.upscale(src);

            await this.replaceImage(active, enhancedSrc);

            this.historyManager.saveState('Upscale Image');
            NotificationManager.success("Image enhanced successfully!");
        } catch (error) {
            console.error("Upscaling failed:", error);
            NotificationManager.error("Failed to enhance image.");
        }
    }

    addShape(type, options = {}) {
        this.shapeManager.addShape(type, options);
    }

    // Advanced Controls & Alignments
    async addSVG(url, options = {}) {
        await this.shapeManager.addSVG(url, options);
    }

    async addSVGString(svgStr, options = {}) {
        await this.shapeManager.addSVGString(svgStr, options);
    }

    loadGoogleFont(fontName) {
        this.fontManager.loadGoogleFont(fontName);
    }

    setTextStyle(prop, value) {
        this.fontManager.setTextStyle(prop, value);
    }

    applyImageFilter(obj, type, value) {
        this.filterManager.applyImageFilter(obj, type, value);
    }

    toggleTextDecoration(prop) {
        return this.fontManager.toggleTextDecoration(prop);
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

    // --- PROFESSIONAL EXPORT SYSTEM ---
    async exportImage(options = {}) {
        const { format = 'png', filename = 'design', quality = 1, multiplier = 2 } = options;

        // Temporarily hide workspace border/guides
        const originalStroke = this.workspace.stroke;
        this.workspace.set({ stroke: 'transparent' });

        // Hide guidelines
        const guides = this.canvas.getObjects().filter(obj => obj.excludeFromExport);
        guides.forEach(g => g.set({ opacity: 0 }));

        // Save and Reset Viewport Logic
        const originalVPT = this.canvas.viewportTransform.slice();
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        try {
            if (format === 'pdf') {
                const dataURL = this.canvas.toDataURL({
                    format: 'png',
                    multiplier: multiplier,
                    left: 0,
                    top: 0,
                    width: this.originalWidth,
                    height: this.originalHeight,
                    enableRetinaScaling: false
                });

                const pdf = new jsPDF({
                    orientation: this.originalWidth > this.originalHeight ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [this.originalWidth, this.originalHeight]
                });

                pdf.addImage(dataURL, 'PNG', 0, 0, this.originalWidth, this.originalHeight);
                pdf.save(`${filename}.pdf`);
            } else if (format === 'json') {
                this.exportProject();
            } else {
                const dataURL = this.canvas.toDataURL({
                    format: format,
                    quality: quality,
                    multiplier: multiplier,
                    left: 0,
                    top: 0,
                    width: this.originalWidth,
                    height: this.originalHeight,
                    enableRetinaScaling: false
                });

                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `${filename}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            NotificationManager.success('Export successful');
        } catch (err) {
            console.error(err);
            NotificationManager.error('Export failed');
        } finally {
            // Restore visual state
            this.canvas.setViewportTransform(originalVPT);
            this.workspace.set({ stroke: originalStroke });
            guides.forEach(g => g.set({ opacity: 1 }));
            this.canvas.requestRenderAll();
        }
    }


    // --- ON-CANVAS CROP SYSTEM ---
    startCropMode() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) {
            NotificationManager.warning("Select an image to crop.");
            return;
        }

        if (this.isCropping) return;
        this.isCropping = true;
        this.cropTarget = active;

        // Save original state
        this._originalControls = active.controls;
        this._originalBorders = {
            borderColor: active.borderColor,
            cornerColor: active.cornerColor,
            cornerStyle: active.cornerStyle,
            transparentCorners: active.transparentCorners
        };

        // Apply Crop Controls (from CropControls.js)
        active.controls = getCropControls();

        // Style for Crop Mode
        active.set({
            borderColor: '#ff9900', // Orange crop theme
            cornerColor: '#ff9900',
            cornerStyle: 'circle',
            transparentCorners: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true
        });

        active.setCoords();
        this.canvas.requestRenderAll();

        if (this.onCropModeChange) this.onCropModeChange(true);
        NotificationManager.info("Drag handles to crop image.");
    }

    applyCrop() {
        // Changes are applied live during drag in CropControls
        this.cancelCrop();
        NotificationManager.success("Crop applied.");
    }

    cancelCrop() {
        if (!this.isCropping || !this.cropTarget) return;

        const active = this.cropTarget;

        // Restore controls
        if (this._originalControls) {
            active.controls = this._originalControls;
            this._originalControls = null;
        }

        // Restore style
        if (this._originalBorders) {
            active.set(this._originalBorders);
            this._originalBorders = null;
        }

        active.set({
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false
        });

        this.isCropping = false;
        this.cropTarget = null;

        active.setCoords();
        this.canvas.requestRenderAll();

        if (this.onCropModeChange) this.onCropModeChange(false);
    }

    // --- PROJECT PERSISTENCE ---
    async loadProject(jsonObj) {
        if (!jsonObj) return;

        try {
            // Restore dimensions
            if (jsonObj.width && jsonObj.height) {
                this.originalWidth = jsonObj.width;
                this.originalHeight = jsonObj.height;
            }

            await this.canvas.loadFromJSON(jsonObj);

            // Fortify and Validate Background
            // Legacy Migration: Convert old Rect Background to Native Background
            const legacyBg = this.canvas.getObjects().find(o => o.name === 'Background');
            if (legacyBg) {
                // It's a legacy project with a Rect object
                this.canvas.remove(legacyBg);

                // Use its properties to set the native background
                // Ensure it's not selectable
                legacyBg.set({
                    selectable: false,
                    evented: false,
                    stroke: '#cccccc', // Ensure border exists
                    strokeWidth: 1
                });

                this.canvas.backgroundImage = legacyBg;
                this.canvas.requestRenderAll();
                this.workspace = legacyBg;
            } else {
                // Check if background image exists (native project)
                if (this.canvas.backgroundImage) {
                    this.workspace = this.canvas.backgroundImage;
                } else {
                    // No background? Init one.
                    this.initWorkspace();
                }
            }

            // Fix: Restore Infinite Canvas physical size
            // loadFromJSON resizes canvas to the JSON dimensions (logical page size)
            // We need to restore it to the container size
            if (this.viewport && this.viewport.handleWindowResize) {
                this.viewport.handleWindowResize();
            }

            this.canvas.requestRenderAll();

            NotificationManager.success('Project loaded');
        } catch (err) {
            console.error('Load Error:', err);
            NotificationManager.error('Failed to load project');
        }
    }

    saveProject() {
        const json = this.canvas.toJSON(this.projectProperties);
        json.width = this.originalWidth;
        json.height = this.originalHeight;
        return json;
    }

    exportProject() {
        const json = this.saveProject();
        json.timestamp = Date.now();

        const jsonString = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `project-${timestamp}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Extracts text from the currently active image using OCR.
     */
    async extractTextFromActiveImage() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || (activeObject.type !== 'image' && activeObject.type !== 'fabric-image')) {
            NotificationManager.warning('Please select an image to extract text.');
            return;
        }

        try {
            NotificationManager.info('Scanning image for text... (Supports Lao/English)', 4000);

            const src = activeObject.getSrc();
            // Use 'lao+eng' to support both languages
            const text = await TextExtractionService.extractText(src, 'lao+eng', (progress) => {
                console.log(`OCR Progress: ${Math.round(progress * 100)}%`);
            });

            if (!text || text.trim().length === 0) {
                NotificationManager.warning('No text found in the image.');
                return;
            }

            // Create a new IText object with the extracted text
            const textObject = new IText(text, {
                left: activeObject.left + 20,
                top: activeObject.top + 20,
                fontSize: 20,
                fontFamily: 'Phetsarath OT', // Default to Lao font
                fill: '#000000',
            });

            this.canvas.add(textObject);
            this.canvas.setActiveObject(textObject);
            this.canvas.renderAll();

            NotificationManager.success('Text extracted successfully!');
            return text;

        } catch (error) {
            console.error('Text extraction failed:', error);
            NotificationManager.error('Failed to extract text.');
            return null;

        }
    }




}
