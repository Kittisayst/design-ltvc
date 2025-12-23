import { compare, applyPatch } from 'fast-json-patch';
import { NotificationManager } from '../NotificationManager.js';

/**
 * Optimized History Manager using fast-json-patch.
 * Stores a full state baseline and subsequent deltas (patches).
 */
export class HistoryManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.history = []; // Array of { state | forward/backward, label }
        this.currentIndex = -1;
        this.locked = false; // Prevent saving while loading
        this.maxDepth = 50;

        // Initial state
        this.saveState('Initial');
    }

    get canvas() { return this.cm.canvas; }

    /**
     * Captures current canvas state and stores the patch difference from previous state.
     */
    saveState(label = null) {
        if (this.locked || !this.canvas) return;

        const newState = this.cm.saveProject();

        if (this.currentIndex === -1) {
            // First record is always a full state
            this.history = [{ state: JSON.parse(JSON.stringify(newState)), label: label || 'Initial' }];
            this.currentIndex = 0;
        } else {
            // Compare with current head
            const prevState = this.getFullState(this.currentIndex);
            const forward = compare(prevState, newState);

            // Avoid saving if no changes detected
            if (forward.length === 0) return;

            const backward = compare(newState, prevState);

            // Truncate redo history if we are in the middle of the stack
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }

            this.history.push({
                forward,
                backward,
                label: label || 'Action'
            });

            this.currentIndex++;

            // Handle max depth - maintain sliding window
            if (this.history.length > this.maxDepth) {
                this.history.shift();
                this.currentIndex--;
                // Important: The new first element MUST be converted to a full state
                // because it no longer has a base to patch against.
                const newBaseState = this.getFullState(0);
                this.history[0] = {
                    state: newBaseState,
                    label: this.history[0].label
                };
            }
        }

        this.notifyUpdate();
    }

    /**
     * Reconstructs the full state at a given index by applying patches sequentially.
     */
    getFullState(index) {
        if (index < 0 || index >= this.history.length) return null;

        // Start with the nearest full state (currently always index 0)
        let state = JSON.parse(JSON.stringify(this.history[0].state));

        // Apply patches up to the requested index
        for (let i = 1; i <= index; i++) {
            state = applyPatch(state, this.history[i].forward).newDocument;
        }

        return state;
    }

    async undo() {
        if (this.currentIndex <= 0) return;

        this.currentIndex--;
        const state = this.getFullState(this.currentIndex);
        await this.loadState(state);
        this.notifyUpdate();
    }

    async redo() {
        if (this.currentIndex >= this.history.length - 1) return;

        this.currentIndex++;
        const state = this.getFullState(this.currentIndex);
        await this.loadState(state);
        this.notifyUpdate();
    }

    async loadState(stateObj) {
        this.locked = true;
        try {
            await this.cm.loadProject(stateObj);
        } catch (err) {
            console.error('History Load Error:', err);
            NotificationManager.error('Failed to restore state');
        } finally {
            this.locked = false;
        }
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    notifyUpdate() {
        window.dispatchEvent(new CustomEvent('historyUpdate', {
            detail: {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                label: this.history[this.currentIndex]?.label || ''
            }
        }));
    }
}
