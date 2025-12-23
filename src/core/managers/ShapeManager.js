import { IText, FabricImage, Group, loadSVGFromURL, loadSVGFromString } from 'fabric';
import { createShape } from '../../config/shapeConfig.js';
import { NotificationManager } from '../NotificationManager.js';

export class ShapeManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
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
        this.canvas.requestRenderAll();
    }

    async addImage(dataUrl, options = {}) {
        try {
            const img = await FabricImage.fromURL(dataUrl);
            if (img.width > this.canvasManager.originalWidth) {
                img.scaleToWidth(this.canvasManager.originalWidth / 2);
            }
            // Apply options
            if (options.fill) {
                img.set({ tint: options.fill });
            }

            this.canvas.add(img);
            // Manual center since centerObject uses physical dimensions which might differ?
            // Using originalWidth for consistent center relative to "Page"
            img.set({
                left: this.canvasManager.originalWidth / 2,
                top: this.canvasManager.originalHeight / 2,
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

    async addSVG(url, options = {}) {
        try {
            const result = await loadSVGFromURL(url);
            const { objects, opts } = result;

            if (objects && objects.length > 0) {
                const group = new Group(objects, {
                    ...opts,
                    ...options,
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
                                if (obj.type === 'path') obj.set('stroke', options.fill);
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
}
