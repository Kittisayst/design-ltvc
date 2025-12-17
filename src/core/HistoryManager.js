export class HistoryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.locked = false; // Prevent recording while undoing
        this.maxDepth = 20;

        // Initial state
        this.saveState();
    }

    saveState() {
        if (this.locked) return;

        // We might want to optimize this to not save if no change?
        // For now, save on every 'object:modified' etc.

        // Fabric 6 might have different toJSON behavior, checking standard.
        const json = JSON.stringify(this.canvas.toJSON());

        this.undoStack.push(json);
        if (this.undoStack.length > this.maxDepth) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo on new action
        // console.log('State saved. Undo stack:', this.undoStack.length);
    }

    async undo() {
        if (this.undoStack.length <= 1) return; // Keep initial state

        this.locked = true;
        const current = this.undoStack.pop();
        this.redoStack.push(current);

        const state = this.undoStack[this.undoStack.length - 1];
        await this.loadState(state);
        this.locked = false;
        // console.log('Undo. Stack:', this.undoStack.length);
    }

    async redo() {
        if (this.redoStack.length === 0) return;

        this.locked = true;
        const state = this.redoStack.pop();
        this.undoStack.push(state);

        await this.loadState(state);
        this.locked = false;
        // console.log('Redo. Stack:', this.undoStack.length);
    }

    async loadState(json) {
        return new Promise((resolve) => {
            this.canvas.loadFromJSON(JSON.parse(json), () => {
                this.canvas.requestRenderAll();
                // We might need to re-bind events or things if lost? 
                // Usually Fabric handles object recreating.
                // But we need to ensure our CanvasManager knows about new objects?
                // The selection/events are on the CANVAS, so they persist.
                resolve();
            });
        });
    }
}
