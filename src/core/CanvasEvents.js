import { NotificationManager } from './NotificationManager.js';

export class CanvasEvents {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.canvas = canvasManager.canvas;

        this.setupEvents();
        this.setupDragDrop();
        this.setupShortcuts();
    }

    dispose() {
        if (this.boundKeydown) {
            document.removeEventListener('keydown', this.boundKeydown);
        }
        if (this.boundKeyup) {
            document.removeEventListener('keyup', this.boundKeyup);
        }
        if (this.boundPaste) {
            document.removeEventListener('paste', this.boundPaste);
        }
        // Remove canvas events
        if (this.canvas) {
            this.canvas.off();
        }
    }

    setupEvents() {
        // We need to access selectionCallback from manager or just trigger it
        const triggerUpdate = () => {
            if (this.cm.selectionCallback) this.cm.selectionCallback(this.canvas.getActiveObject());
        };

        let debounceTimer;
        let pendingLabel = 'Modification';

        const debounceSave = (label) => {
            pendingLabel = label;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                saveHistory(pendingLabel);
            }, 500); // 500ms debounce
        };

        const getObjectLabel = (obj, action) => {
            if (!obj) return action;
            const type = obj.type === 'i-text' ? 'Text' :
                obj.type === 'image' ? 'Image' :
                    obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
            return `${action} ${type}`;
        };

        const saveHistory = (label = 'Modification', target = null) => {
            if (this.cm.historyManager) {
                this.cm.historyManager.saveState(label);
            }
        };

        this.canvas.on('selection:created', triggerUpdate);
        this.canvas.on('selection:updated', triggerUpdate);
        this.canvas.on('selection:cleared', triggerUpdate);

        // Ensure freehand drawings have uniform stroke
        this.canvas.on('path:created', (e) => {
            const path = e.path;
            if (path) {
                path.set('strokeUniform', true);
                path.setCoords();
                this.canvas.requestRenderAll();
            }
        });

        // Debounced modification
        this.canvas.on('object:modified', (e) => {
            triggerUpdate();
            const label = getObjectLabel(e.target, 'Modified');
            debounceSave(label);
        });

        this.canvas.on('object:added', (e) => {
            if (e.target && !e.target.isSmartGuide && !e.target.excludeFromExport) {
                const label = getObjectLabel(e.target, 'Added');
                saveHistory(label, e.target);
            }
        });
        this.canvas.on('object:removed', (e) => {
            if (e.target && !e.target.isSmartGuide && !e.target.excludeFromExport) {
                const label = getObjectLabel(e.target, 'Removed');
                saveHistory(label, e.target);
            }
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
        this.boundKeydown = async (e) => {
            // Ignore if focus is on input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            if (e.repeat) return;

            // SAFETY: Check if cm and canvas still exist
            if (!this.cm || !this.cm.canvas) return;

            const active = this.cm.getActiveObject();

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.cm.removeActiveObject();
                return;
            }

            // Nudge
            if (active) {
                const step = e.shiftKey ? 10 : 1;
                let moved = false;
                if (e.key === 'ArrowLeft') { e.preventDefault(); this.cm.nudgeActiveObject(-step, 0); moved = true; }
                else if (e.key === 'ArrowRight') { e.preventDefault(); this.cm.nudgeActiveObject(step, 0); moved = true; }
                else if (e.key === 'ArrowUp') { e.preventDefault(); this.cm.nudgeActiveObject(0, -step); moved = true; }
                else if (e.key === 'ArrowDown') { e.preventDefault(); this.cm.nudgeActiveObject(0, step); moved = true; }
            }

            // Copy / Paste / Duplicate (Ctrl+C / Ctrl+V / Ctrl+D)
            if (e.ctrlKey || e.metaKey) {
                if (e.code === 'KeyC') {
                    e.preventDefault();
                    await this.cm.copy();
                }
                if (e.code === 'KeyV') {
                    // We DO NOT preventDefault here to allow the native 'paste' event to fire.
                    // This is necessary to capture images from the system clipboard.
                    // The internal paste (Fabric objects) will be handled either here 
                    // OR we can check if there's internal clipboard data.
                    if (this.cm.clipboardManager.clipboard) {
                        e.preventDefault();
                        await this.cm.paste();
                    }
                }
                if (e.code === 'KeyD') {
                    e.preventDefault();
                    this.cm.duplicateActiveObject();
                }
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

            // Select All (Ctrl+A)
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
                e.preventDefault();
                if (this.cm.selectAll) {
                    this.cm.selectAll();
                }
            }

            // Spacebar Panning
            if (e.code === 'Space' || e.key === ' ') {
                if (active && active.isEditing) return; // Allow typing spaces in text
                if (this.cm.viewport && this.cm.viewport.isSpacePanning) return;
                e.preventDefault();
                if (this.cm.viewport) this.cm.viewport.setSpacePanning(true);
            }
        };

        this.boundKeyup = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                if (this.cm && this.cm.viewport) {
                    this.cm.viewport.setSpacePanning(false);
                }
            }
        };

        this.boundPaste = async (e) => {
            // Ignore if focus is on input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            const clipboardData = e.clipboardData || window.clipboardData;
            if (!clipboardData) return;

            const items = clipboardData.items;
            let imageFound = false;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    imageFound = true;
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.cm.addImage(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                    NotificationManager.success('Image pasted from clipboard');
                }
            }

            // If we found and handled an image, we should prevent default
            if (imageFound) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', this.boundKeydown);
        document.addEventListener('keyup', this.boundKeyup);
        document.addEventListener('paste', this.boundPaste);
    }
}
