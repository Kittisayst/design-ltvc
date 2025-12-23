import { Line, Rect, Pattern } from 'fabric';

export class GridManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.gridObject = null;
        this.snapThreshold = 10;
        this.guidelines = [];
    }

    get canvas() {
        return this.cm.canvas;
    }

    get originalWidth() {
        return this.cm.originalWidth;
    }

    get originalHeight() {
        return this.cm.originalHeight;
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
        if (this.cm.workspace) {
            const wsIndex = this.canvas.getObjects().indexOf(this.cm.workspace);
            this.canvas.moveObjectTo(gridRect, wsIndex + 1);
        } else {
            this.canvas.sendObjectToBack(gridRect);
        }

        this.canvas.requestRenderAll();
        return true;
    }

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

    handleObjectMoving(e) {
        const target = e.target;
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
            this.canvas.getObjects().forEach(obj => {
                if (obj === target || obj === this.cm.workspace || !obj.visible) return;

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
            this.canvas.getObjects().forEach(obj => {
                if (obj === target || obj === this.cm.workspace || !obj.visible) return;

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
        if (!this.canvas) return;
        // Remove lines with specific ID or property
        this.canvas.getObjects('line').forEach(obj => {
            if (obj.isSmartGuide) {
                this.canvas.remove(obj);
            }
        });
        this.canvas.requestRenderAll();
    }

    drawVerticalLine(x) {
        this.drawGuideLine([x, 0, x, this.originalHeight]);
    }

    drawHorizontalLine(y) {
        this.drawGuideLine([0, y, this.originalWidth, y]);
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
}
