import { PencilBrush } from 'fabric';

/**
 * Manages free-drawing mode, brush settings.
 */
export class DrawingManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
    }

    get canvas() { return this.cm.canvas; }

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
}
