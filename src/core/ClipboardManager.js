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

        // Shift clipboard for next paste
        this.clipboard.top += 10;
        this.clipboard.left += 10;

        this.canvas.setActiveObject(clone);
        this.canvas.requestRenderAll();

        NotificationManager.success('Pasted object');
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
