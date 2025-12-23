import { Group, Point, ActiveSelection, util } from 'fabric';
import { NotificationManager } from '../NotificationManager.js';

export class ObjectManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
    }



    getActiveObject() {
        return this.canvasManager.getActiveObject();
    }

    // --- MANIPULATION ---

    async duplicate() {
        // Delegate to ClipboardManager via CanvasManager or directly? 
        // CanvasManager has clipboardManager. 
        // Let's stick to CanvasManager delegation for clipboard for now, 
        // OR move duplicate logic here if it doesn't use system clipboard.
        // CanvasManager implementation: await this.clipboardManager.duplicate();
        // So ObjectManager should just call canvasManager.clipboardManager.duplicate()?
        // Actually, duplicate is high-level action. Let's keep it in CanvasManager or move here if it fits.
        // For consistency with "ObjectManager handles manipulation", it fits here, but it relies on Clipboard.
        // Let's keep duplicate in CanvasManager for now as it uses ClipboardManager directly.
    }

    toggleLock() {
        const active = this.getActiveObject();
        if (!active) return;

        const isLocked = !active.lockMovementX;
        active.set({
            lockMovementX: isLocked,
            lockMovementY: isLocked,
            lockScalingX: isLocked,
            lockScalingY: isLocked,
            lockRotation: isLocked,
            hasControls: !isLocked,
            selectable: true
        });

        this.canvas.requestRenderAll();
        NotificationManager.info(isLocked ? 'Object locked' : 'Object unlocked');
    }

    reset() {
        // Discard active object helper
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    // --- REMOVE ---
    remove() {
        const active = this.getActiveObject();
        if (!active || active.isEditing) return;





        if (active.type === 'activeSelection' || active instanceof ActiveSelection) {
            active.forEachObject((obj) => {
                // Protect background from selection deletion
                this.canvas.remove(obj);
            });
        } else {
            this.canvas.remove(active);
        }

        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();



        if (this.canvasManager.selectionCallback) this.canvasManager.selectionCallback(null);
        NotificationManager.success('Object(s) removed');
    }

    // --- LAYERING ---
    flip(direction) {
        const active = this.getActiveObject();
        if (!active) return;

        if (active.type === 'activeSelection') {
            active.forEachObject(obj => {
                if (direction === 'horizontal') obj.set('flipX', !obj.flipX);
                else obj.set('flipY', !obj.flipY);
            });
        } else {
            if (direction === 'horizontal') active.set('flipX', !active.flipX);
            else active.set('flipY', !active.flipY);
        }

        this.canvas.requestRenderAll();
        this.canvas.requestRenderAll();
    }

    layer(direction) {
        switch (direction) {
            case 'up': this.bringForward(); break;
            case 'down': this.sendBackward(); break;
            case 'front': this.bringToFront(); break;
            case 'back': this.sendToBack(); break;
        }
    }

    bringForward() {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.bringObjectForward(active);
            this.canvas.renderAll();
            this.canvas.fire('layer:updated');
        }
    }

    sendBackward() {
        const active = this.getActiveObject();
        if (active) {
            const index = this.canvas.getObjects().indexOf(active);
            if (index > 0) {
                this.canvas.sendObjectBackwards(active);
                this.canvas.renderAll();
                this.canvas.fire('layer:updated');
            }
        }
    }

    bringToFront() {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.bringObjectToFront(active);
            this.canvas.renderAll();
            this.canvas.fire('layer:updated');
        }
    }

    sendToBack() {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.sendObjectToBack(active);
            // Ensure workspace stays at back
            if (this.canvasManager.workspace) {
                this.canvas.sendObjectToBack(this.canvasManager.workspace);
            }
            this.canvas.renderAll();
            this.canvas.fire('layer:updated');
        }
    }

    // --- GROUP / UNGROUP ---
    group() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'activeSelection' && active.type !== 'activeselection')) return;



        const objects = active.getObjects();
        this.canvas.discardActiveObject();
        objects.forEach(obj => this.canvas.remove(obj));

        const group = new Group(objects, {
            selectable: true,
            evented: true,
            subTargetCheck: false,
            interactive: false
        });

        group.setCoords();
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();

        NotificationManager.success('Grouped objects');
    }

    async ungroup() {
        const active = this.getActiveObject();
        if (!active || (active.type !== 'group' && active.type !== 'Group')) return;



        const groupMatrix = active.calcTransformMatrix();
        const groupAngle = active.angle || 0;
        const groupScaleX = active.scaleX || 1;
        const groupScaleY = active.scaleY || 1;
        const objects = [...active.getObjects()];

        this.canvas.remove(active);
        this.canvas.discardActiveObject();

        const newObjects = [];
        const clonePromises = objects.map(obj => obj.clone());
        const clonedObjects = await Promise.all(clonePromises);

        for (let i = 0; i < clonedObjects.length; i++) {
            const obj = objects[i];
            const clone = clonedObjects[i];

            const absolutePos = util.transformPoint(
                new Point(obj.left, obj.top),
                groupMatrix
            );

            clone.set({
                left: absolutePos.x,
                top: absolutePos.y,
                angle: (obj.angle || 0) + groupAngle,
                scaleX: (obj.scaleX || 1) * groupScaleX,
                scaleY: (obj.scaleY || 1) * groupScaleY,
                group: null,
                selectable: true,
                evented: true,
                dirty: true
            });

            clone.setCoords();
            this.canvas.add(clone);
            newObjects.push(clone);
        }

        if (newObjects.length > 0) {
            const selection = new ActiveSelection(newObjects, {
                canvas: this.canvas
            });
            this.canvas.setActiveObject(selection);
        }

        this.canvas.requestRenderAll();

        NotificationManager.success('Ungrouped objects');
    }
}
