import { Group, Point, ActiveSelection, util, FabricObject } from 'fabric';
import { NotificationManager } from '../NotificationManager.js';
import type { ICanvasManager } from '../types';

export class ObjectManager {
    private canvasManager: ICanvasManager;

    constructor(canvasManager: ICanvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
    }

    getActiveObject(): FabricObject | null {
        return this.canvasManager.getActiveObject();
    }

    // --- MANIPULATION ---

    toggleLock(): void {
        const active = this.getActiveObject() as any;
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

    reset(): void {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    // --- REMOVE ---
    remove(): void {
        const active = this.getActiveObject() as any;
        if (!active || active.isEditing) return;

        if (active.type === 'activeSelection' || active instanceof ActiveSelection) {
            active.forEachObject((obj: FabricObject) => {
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
    flip(direction: 'horizontal' | 'vertical'): void {
        const active = this.getActiveObject() as any;
        if (!active) return;

        if (active.type === 'activeSelection') {
            active.forEachObject((obj: any) => {
                if (direction === 'horizontal') obj.set('flipX', !obj.flipX);
                else obj.set('flipY', !obj.flipY);
            });
        } else {
            if (direction === 'horizontal') active.set('flipX', !active.flipX);
            else active.set('flipY', !active.flipY);
        }

        this.canvas.requestRenderAll();
    }

    layer(direction: 'up' | 'down' | 'front' | 'back'): void {
        switch (direction) {
            case 'up': this.bringForward(); break;
            case 'down': this.sendBackward(); break;
            case 'front': this.bringToFront(); break;
            case 'back': this.sendToBack(); break;
        }
    }

    bringForward(): void {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.bringObjectForward(active);
            this.canvas.renderAll();
            (this.canvas as any).fire('layer:updated');
        }
    }

    sendBackward(): void {
        const active = this.getActiveObject();
        if (active) {
            const index = this.canvas.getObjects().indexOf(active);
            if (index > 0) {
                this.canvas.sendObjectBackwards(active);
                this.canvas.renderAll();
                (this.canvas as any).fire('layer:updated');
            }
        }
    }

    bringToFront(): void {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.bringObjectToFront(active);
            this.canvas.renderAll();
            (this.canvas as any).fire('layer:updated');
        }
    }

    sendToBack(): void {
        const active = this.getActiveObject();
        if (active) {
            this.canvas.sendObjectToBack(active);
            // Ensure workspace stays at back
            if (this.canvasManager.workspace) {
                this.canvas.sendObjectToBack(this.canvasManager.workspace);
            }
            this.canvas.renderAll();
            (this.canvas as any).fire('layer:updated');
        }
    }

    // --- GROUP / UNGROUP ---
    group(): void {
        const active = this.getActiveObject() as any;
        if (!active || (active.type !== 'activeSelection' && active.type !== 'activeselection')) return;

        const objects = active.getObjects();
        this.canvas.discardActiveObject();
        objects.forEach((obj: FabricObject) => this.canvas.remove(obj));

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

    async ungroup(): Promise<void> {
        const active = this.getActiveObject() as any;
        if (!active || (active.type !== 'group' && active.type !== 'Group')) return;

        const groupMatrix = active.calcTransformMatrix();
        const groupAngle = active.angle || 0;
        const groupScaleX = active.scaleX || 1;
        const groupScaleY = active.scaleY || 1;
        const objects = [...active.getObjects()];

        this.canvas.remove(active);
        this.canvas.discardActiveObject();

        const newObjects: FabricObject[] = [];
        const clonePromises = objects.map((obj: FabricObject) => obj.clone());
        const clonedObjects = await Promise.all(clonePromises);

        for (let i = 0; i < clonedObjects.length; i++) {
            const obj = objects[i] as any;
            const clone = clonedObjects[i] as any;

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
