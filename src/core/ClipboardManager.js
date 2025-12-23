import { NotificationManager } from './NotificationManager.js';

export class ClipboardManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.clipboard = null;
    }

    get canvas() { return this.cm.canvas; }
    get hasInternalContent() { return !!this.clipboard; }


    async copy() {
        const active = this.canvas.getActiveObject();
        if (active) {
            const clone = await active.clone();
            this.clipboard = clone;
            NotificationManager.info('Copied to clipboard');
        }
    }

    async paste() {
        // 1. Try internal clipboard first (Fabric objects)
        if (this.clipboard) {
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

            // Shift internal clipboard for next paste
            this.clipboard.top += 10;
            this.clipboard.left += 10;

            this.canvas.setActiveObject(clone);
            this.canvas.requestRenderAll();
            NotificationManager.success('Pasted object');
            return;
        }

        // 2. Fallback: Try System Clipboard (Text)
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Determine center of viewport
                const vpt = this.canvas.viewportTransform;
                const center = this.canvas.getCenter();
                // Adjust for viewport pan/zoom
                const centerX = (center.left - vpt[4]) / vpt[0];
                const centerY = (center.top - vpt[5]) / vpt[3];

                const iText = new fabric.IText(text, {
                    left: centerX,
                    top: centerY,
                    originX: 'center',
                    originY: 'center',
                    fontFamily: 'Noto Sans Lao', // Default to Lao font support
                    fontSize: 40,
                    fill: '#ffffff'
                });

                this.canvas.add(iText);
                this.canvas.setActiveObject(iText);
                this.canvas.requestRenderAll();
                NotificationManager.success('Pasted text from clipboard');
            }
        } catch (err) {
            console.warn('Clipboard read permission denied or empty', err);
            // NotificationManager.info('Clipboard is empty'); 
        }
    }

    async duplicate() {
        const active = this.canvas.getActiveObject();
        if (!active) return;

        const clone = await active.clone();
        this.canvas.discardActiveObject();
        clone.set({
            left: (active.left || 0) + 10,
            top: (active.top || 0) + 10,
            evented: true
        });

        if (clone.type === 'activeSelection') {
            clone.canvas = this.canvas;
            clone.forEachObject((obj) => this.canvas.add(obj));
            clone.setCoords();
        } else {
            this.canvas.add(clone);
        }

        this.canvas.setActiveObject(clone);
        this.canvas.requestRenderAll();

        NotificationManager.success('Object duplicated');
    }
}
