import { NotificationManager } from '../ui/NotificationManager.js';

export class CanvasEvents {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.canvas = canvasManager.canvas;

        this.setupEvents();
        this.setupDragDrop();
        this.setupShortcuts();
    }

    setupEvents() {
        // We need to access selectionCallback from manager or just trigger it
        const triggerUpdate = () => {
            if (this.cm.selectionCallback) this.cm.selectionCallback(this.canvas.getActiveObject());
        };

        const saveHistory = () => {
            this.cm.history.saveState();
        };

        this.canvas.on('selection:created', triggerUpdate);
        this.canvas.on('selection:updated', triggerUpdate);
        this.canvas.on('selection:cleared', triggerUpdate);
        this.canvas.on('object:modified', () => { triggerUpdate(); saveHistory(); });
        this.canvas.on('object:added', (e) => {
            if (e.target && !e.target.isSmartGuide && !e.target.excludeFromExport) saveHistory();
        });
        this.canvas.on('object:removed', (e) => {
            if (e.target && !e.target.isSmartGuide && !e.target.excludeFromExport) saveHistory();
        });
        this.canvas.on('object:moving', (e) => {
            triggerUpdate();

            // Grid Snapping
            if (this.cm.snapToGrid) this.cm.snapToGrid(e.target);

            // Handle guidelines if implemented in manager
            if (this.cm.handleObjectMoving) this.cm.handleObjectMoving(e);
        });
        this.canvas.on('object:scaling', triggerUpdate);
        this.canvas.on('object:rotating', triggerUpdate);

        this.canvas.on('mouse:up', () => {
            if (this.cm.clearGuidelines) this.cm.clearGuidelines();
        });
    }

    setupDragDrop() {
        const dropZone = this.canvas.wrapperEl; // Fabric wrapper

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (f) => this.cm.addImage(f.target.result);
                reader.readAsDataURL(file);
                NotificationManager.success('Image uploaded via drag & drop');
            }
        });
    }

    setupShortcuts() {
        document.addEventListener('keydown', async (e) => {
            const active = this.cm.getActiveObject();
            if (!active && e.code !== 'KeyV' && e.code !== 'Space') return; // Paste doesn't always need active, space doesn't

            // Nudge
            if (active) {
                const step = e.shiftKey ? 10 : 1;
                let moved = false;
                if (e.key === 'ArrowLeft') { e.preventDefault(); active.set('left', active.left - step); moved = true; }
                else if (e.key === 'ArrowRight') { e.preventDefault(); active.set('left', active.left + step); moved = true; }
                else if (e.key === 'ArrowUp') { e.preventDefault(); active.set('top', active.top - step); moved = true; }
                else if (e.key === 'ArrowDown') { e.preventDefault(); active.set('top', active.top + step); moved = true; }

                if (moved) {
                    active.setCoords();
                    this.canvas.requestRenderAll();
                    this.canvas.fire('object:modified', { target: active });
                }
            }

            // Copy / Paste (Ctrl+C / Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC')) {
                e.preventDefault();
                await this.cm.copy();
            }
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyV')) {
                e.preventDefault();
                await this.cm.paste();
            }

            // Group / Ungroup
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyG')) {
                e.preventDefault();
                if (e.shiftKey) {
                    this.cm.ungroup();
                } else {
                    this.cm.group();
                }
            }

            // Spacebar Panning
            if (e.code === 'Space' || e.key === ' ') {
                if (active && active.isEditing) return; // Allow typing spaces in text

                if (this.cm.viewport.isSpacePanning) return;

                e.preventDefault();

                // Update viewport state
                this.cm.viewport.setSpacePanning(true);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                this.cm.viewport.setSpacePanning(false);
            }
        });
    }
}
