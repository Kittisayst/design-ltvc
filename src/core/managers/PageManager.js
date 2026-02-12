import { NotificationManager } from '../NotificationManager.js';

/**
 * PageManager — manages multiple pages/canvases.
 * Each page stores a serialized canvas state (JSON).
 * Only one page is "active" on the canvas at a time.
 */
export class PageManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.pages = [];        // [{id, label, data, thumbnail}]
        this.currentPageIndex = 0;
        this._nextId = 1;
        this.onPagesChange = null; // callback for React

        // Save initial page
        this._initFirstPage();
    }

    get canvas() { return this.cm.canvas; }

    _initFirstPage() {
        // Defer until canvas and workspace are fully ready
        const tryInit = () => {
            if (!this.cm.canvas || !this.cm.workspace) {
                setTimeout(tryInit, 300);
                return;
            }
            try {
                const data = this.cm.saveProject();
                this.pages = [{
                    id: this._nextId++,
                    label: 'Page 1',
                    data,
                    thumbnail: null
                }];
                this._generateThumbnail(0);
                this._notify();
            } catch (err) {
                // Canvas not ready yet, retry
                setTimeout(tryInit, 300);
            }
        };
        setTimeout(tryInit, 300);
    }

    /**
     * Get all pages info (without heavy data).
     */
    getPages() {
        return this.pages.map((p, i) => ({
            id: p.id,
            label: p.label,
            thumbnail: p.thumbnail,
            active: i === this.currentPageIndex
        }));
    }

    getPageCount() {
        return this.pages.length;
    }

    getCurrentPageIndex() {
        return this.currentPageIndex;
    }

    /**
     * Switch to a page by index.
     */
    async switchToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPageIndex) return;

        // Save current page state + thumbnail
        await this._saveCurrentPage();

        // Load target page
        this.currentPageIndex = index;
        const page = this.pages[index];

        try {
            await this.cm.loadProject(page.data);
        } catch (err) {
            console.error('PageManager: Failed to load page', err);
            NotificationManager.error('Failed to switch page');
        }

        this._notify();
    }

    /**
     * Add a new blank page after the current page.
     */
    async addPage() {
        // Save current page first
        await this._saveCurrentPage();

        const newIndex = this.currentPageIndex + 1;
        const newPage = {
            id: this._nextId++,
            label: `Page ${this.pages.length + 1}`,
            data: null,
            thumbnail: null
        };

        this.pages.splice(newIndex, 0, newPage);

        // Clear canvas for new page (keep workspace)
        this._clearCanvasObjects();
        this.currentPageIndex = newIndex;

        // Save the blank page state
        newPage.data = this.cm.saveProject();
        this._generateThumbnail(newIndex);
        this._notify();

        NotificationManager.info(`Added ${newPage.label}`);
    }

    /**
     * Duplicate the current page.
     */
    async duplicatePage() {
        await this._saveCurrentPage();

        const currentPage = this.pages[this.currentPageIndex];
        const newIndex = this.currentPageIndex + 1;
        const newPage = {
            id: this._nextId++,
            label: `Page ${this.pages.length + 1}`,
            data: JSON.parse(JSON.stringify(currentPage.data)),
            thumbnail: currentPage.thumbnail
        };

        this.pages.splice(newIndex, 0, newPage);
        this.currentPageIndex = newIndex;
        this._notify();

        NotificationManager.info(`Duplicated to ${newPage.label}`);
    }

    /**
     * Delete a page by index.
     */
    async deletePage(index) {
        if (this.pages.length <= 1) {
            NotificationManager.info('Cannot delete the only page');
            return;
        }

        this.pages.splice(index, 1);

        // Adjust current index
        if (this.currentPageIndex >= this.pages.length) {
            this.currentPageIndex = this.pages.length - 1;
        } else if (index <= this.currentPageIndex && this.currentPageIndex > 0) {
            this.currentPageIndex--;
        }

        // Load the now-current page
        const page = this.pages[this.currentPageIndex];
        try {
            await this.cm.loadProject(page.data);
        } catch (err) {
            console.error('PageManager: Failed to load after delete', err);
        }

        this._notify();
        NotificationManager.info('Page deleted');
    }

    /**
     * Reorder pages (move from oldIndex to newIndex).
     */
    reorderPages(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;
        const [page] = this.pages.splice(oldIndex, 1);
        this.pages.splice(newIndex, 0, page);

        // Update current index
        if (this.currentPageIndex === oldIndex) {
            this.currentPageIndex = newIndex;
        } else if (oldIndex < this.currentPageIndex && newIndex >= this.currentPageIndex) {
            this.currentPageIndex--;
        } else if (oldIndex > this.currentPageIndex && newIndex <= this.currentPageIndex) {
            this.currentPageIndex++;
        }

        this._notify();
    }

    /**
     * Save current page state and generate thumbnail.
     */
    async _saveCurrentPage() {
        const page = this.pages[this.currentPageIndex];
        if (page) {
            page.data = this.cm.saveProject();
            this._generateThumbnail(this.currentPageIndex);
        }
    }

    /**
     * Generate a thumbnail for a page.
     */
    _generateThumbnail(index) {
        try {
            const workspace = this.cm.workspace;
            if (!workspace) return;

            const zoom = this.canvas.getZoom();
            const vpt = this.canvas.viewportTransform;

            // Temporarily reset viewport for clean thumbnail
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            const dataUrl = this.canvas.toDataURL({
                format: 'png',
                quality: 0.5,
                left: 0,
                top: 0,
                width: this.cm.originalWidth,
                height: this.cm.originalHeight,
                multiplier: 120 / this.cm.originalWidth // ~120px wide thumbnail
            });

            // Restore viewport
            this.canvas.setViewportTransform(vpt);

            if (this.pages[index]) {
                this.pages[index].thumbnail = dataUrl;
            }
        } catch (err) {
            // Thumbnail generation is non-critical
            console.warn('Thumbnail generation failed:', err);
        }
    }

    /**
     * Clear all objects except workspace.
     */
    _clearCanvasObjects() {
        const objects = this.canvas.getObjects().filter(o => o !== this.cm.workspace);
        objects.forEach(o => this.canvas.remove(o));
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    /**
     * Get all pages data for multi-page export/save.
     */
    async getAllPagesData() {
        await this._saveCurrentPage();
        return this.pages.map(p => ({
            id: p.id,
            label: p.label,
            data: p.data
        }));
    }

    _notify() {
        if (this.onPagesChange) {
            this.onPagesChange(this.getPages());
        }
    }
}
