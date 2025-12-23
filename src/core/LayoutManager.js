import { NotificationManager } from './NotificationManager.js';

export class LayoutManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
    }

    get canvas() { return this.cm.canvas; }
    get workspace() { return this.cm.workspace; }

    /**
     * Aligns objects.
     * If multiple objects selected: Aligns them within selection bounds.
     * If one object selected: Aligns it to workspace.
     */
    align(type, forceWorkspace = false) {
        const active = this.canvas.getActiveObject();
        if (!active) return;

        const typeStr = active.type ? active.type.toLowerCase() : '';
        const isSelection = typeStr === 'activeselection';
        const objects = (isSelection && !forceWorkspace) ? active.getObjects() : [active];


        // Bounds to align to
        let targetBounds;
        if (isSelection && !forceWorkspace) {
            targetBounds = active.getBoundingRect();
        } else {
            targetBounds = {
                left: this.workspace.left,
                top: this.workspace.top,
                width: this.workspace.width,
                height: this.workspace.height
            };
        }

        objects.forEach(obj => {
            const isMember = isSelection && !forceWorkspace;

            // For selection members, get the bounding box relative to the selection center
            // Fabric v6: getBoundingRect() with no args or true is absolute. 
            // To get local in selection, we often need to account for how ActiveSelection stores objects.
            // Actually, a simpler way for selection members:
            const objBounds = isMember ? obj.getBoundingRect() : obj.getBoundingRect(true);

            // If isMember, objBounds is global. targetBounds is also global (active.getBoundingRect()).
            // This is safer! Align everything in global space, then Fabric handles the local sync
            // IF we are not in an active selection. 
            // BUT wait, if we are IN an active selection, we MUST move them relatively or discard/re-select.

            // New strategy: If selection, move objects in global space, then call _calcBounds
            const containerBounds = (isSelection && !forceWorkspace) ? active.getBoundingRect() : targetBounds;

            let deltaX = 0;
            let deltaY = 0;

            switch (type) {
                case 'left':
                    deltaX = containerBounds.left - objBounds.left;
                    break;
                case 'center':
                    deltaX = (containerBounds.left + containerBounds.width / 2) - (objBounds.left + objBounds.width / 2);
                    break;
                case 'right':
                    deltaX = (containerBounds.left + containerBounds.width) - (objBounds.left + objBounds.width);
                    break;
                case 'top':
                    deltaY = containerBounds.top - objBounds.top;
                    break;
                case 'middle':
                    deltaY = (containerBounds.top + containerBounds.height / 2) - (objBounds.top + objBounds.height / 2);
                    break;
                case 'bottom':
                    deltaY = (containerBounds.top + containerBounds.height) - (objBounds.top + objBounds.height);
                    break;
            }

            if (deltaX !== 0 || deltaY !== 0) {
                obj.set({
                    left: obj.left + deltaX,
                    top: obj.top + deltaY
                });
                obj.setCoords();
            }
        });

        // Update selection box
        if (isSelection && !forceWorkspace) {
            if (typeof active._calcBounds === 'function') {
                active._calcBounds();
            }
            active.setCoords();
            active.set('dirty', true);
        }

        // Force a full refresh and notify listeners
        this.canvas.fire('object:modified', { target: active });
        this.canvas.renderAll();

        if (this.cm.historyManager) this.cm.historyManager.saveState(`Align ${type}`);
    }

    /**
     * Distributes objects evenly by spacing (gap), not just centers.
     */
    distribute(direction) {
        const active = this.canvas.getActiveObject();
        if (!active) return;
        const typeStr = active.type ? active.type.toLowerCase() : '';
        if (typeStr !== 'activeselection') return;

        // Sort by their true visual position
        const sorted = active.getObjects().map(obj => ({
            obj,
            bounds: obj.getBoundingRect() // Use absolute bounds for sorting and math
        })).sort((a, b) => {
            return direction === 'horizontal' ? a.bounds.left - b.bounds.left : a.bounds.top - b.bounds.top;
        });

        if (sorted.length < 3) return;

        const isHorizontal = direction === 'horizontal';
        const totalSize = sorted.reduce((sum, item) => sum + (isHorizontal ? item.bounds.width : item.bounds.height), 0);

        // Use the selection's visual bounds
        const containerRect = active.getBoundingRect();
        const containerSize = isHorizontal ? containerRect.width : containerRect.height;

        const totalGap = containerSize - totalSize;
        const gap = totalGap / (sorted.length - 1);

        let currentPos = isHorizontal ? containerRect.left : containerRect.top;

        sorted.forEach(item => {
            const obj = item.obj;
            const objBounds = item.bounds;

            if (isHorizontal) {
                const deltaX = currentPos - objBounds.left;
                obj.set('left', obj.left + deltaX);
                currentPos += objBounds.width + gap;
            } else {
                const deltaY = currentPos - objBounds.top;
                obj.set('top', obj.top + deltaY);
                currentPos += objBounds.height + gap;
            }
            obj.setCoords();
            obj.set('dirty', true);
        });

        // Update selection box
        if (typeof active._calcBounds === 'function') {
            active._calcBounds();
        }
        active.setCoords();
        active.set('dirty', true);

        // Force refresh
        this.canvas.fire('object:modified', { target: active });
        this.canvas.renderAll();

        if (this.cm.historyManager) this.cm.historyManager.saveState(`Distribute ${direction}`);
    }
}
