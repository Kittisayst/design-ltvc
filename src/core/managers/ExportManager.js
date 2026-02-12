import { jsPDF } from 'jspdf';
import { NotificationManager } from '../NotificationManager.js';

/**
 * Handles all export operations: PNG, JPG, PDF, JSON.
 */
export class ExportManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
    }

    get canvas() { return this.cm.canvas; }

    _isTransparentFill(fill) {
        if (!fill || fill === 'transparent' || fill === '') return true;
        if (typeof fill === 'string' && fill.startsWith('rgba')) {
            const match = fill.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
            if (match && parseFloat(match[1]) === 0) return true;
        }
        return false;
    }

    async exportImage(options = {}) {
        const { format = 'png', filename = 'design', quality = 1, multiplier = 2 } = options;

        // Temporarily hide workspace border/guides
        const originalStroke = this.cm.workspace.stroke;
        const originalShadow = this.cm.workspace.shadow;
        this.cm.workspace.set({ stroke: 'transparent', shadow: null });

        // Hide guidelines
        const guides = this.canvas.getObjects().filter(obj => obj.excludeFromExport);
        guides.forEach(g => g.set({ opacity: 0 }));

        // Save and Reset Viewport Logic
        const originalVPT = this.canvas.viewportTransform.slice();
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        // Handle transparent background:
        // - Remove canvas.backgroundColor (editor void color) so it doesn't bleed through
        // - For JPG/PDF (no alpha), force white workspace fill when transparent
        const originalCanvasBg = this.canvas.backgroundColor;
        const originalWorkspaceFill = this.cm.workspace.fill;
        const isTransparent = this._isTransparentFill(originalWorkspaceFill);

        this.canvas.backgroundColor = 'transparent';

        if (isTransparent && (format === 'jpeg' || format === 'jpg')) {
            this.cm.workspace.set({ fill: '#ffffff' });
        }

        try {
            if (format === 'pdf') {
                // PDF doesn't support transparency — use white background if transparent
                if (isTransparent) {
                    this.cm.workspace.set({ fill: '#ffffff' });
                }

                const dataURL = this.canvas.toDataURL({
                    format: 'png',
                    multiplier: multiplier,
                    left: 0,
                    top: 0,
                    width: this.cm.originalWidth,
                    height: this.cm.originalHeight,
                    enableRetinaScaling: false
                });

                const pdf = new jsPDF({
                    orientation: this.cm.originalWidth > this.cm.originalHeight ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [this.cm.originalWidth, this.cm.originalHeight]
                });

                pdf.addImage(dataURL, 'PNG', 0, 0, this.cm.originalWidth, this.cm.originalHeight);
                pdf.save(`${filename}.pdf`);
            } else if (format === 'json') {
                this.exportProject();
            } else {
                const dataURL = this.canvas.toDataURL({
                    format: format,
                    quality: quality,
                    multiplier: multiplier,
                    left: 0,
                    top: 0,
                    width: this.cm.originalWidth,
                    height: this.cm.originalHeight,
                    enableRetinaScaling: false
                });

                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `${filename}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            NotificationManager.success('Export successful');
        } catch (err) {
            console.error(err);
            NotificationManager.error('Export failed');
        } finally {
            // Restore visual state
            this.canvas.backgroundColor = originalCanvasBg;
            this.cm.workspace.set({ fill: originalWorkspaceFill, stroke: originalStroke, shadow: originalShadow });
            this.canvas.setViewportTransform(originalVPT);
            guides.forEach(g => g.set({ opacity: 1 }));
            this.canvas.requestRenderAll();
        }
    }

    /**
     * Export all pages as a multi-page PDF.
     */
    async exportMultiPagePDF(options = {}) {
        const { filename = 'design', multiplier = 2 } = options;
        const pm = this.cm.pageManager;
        if (!pm || pm.getPageCount() <= 1) {
            // Single page — use normal export
            return this.exportImage({ format: 'pdf', filename, multiplier });
        }

        try {
            // Save current page first
            await pm._saveCurrentPage();
            const originalIndex = pm.getCurrentPageIndex();

            const w = this.cm.originalWidth;
            const h = this.cm.originalHeight;
            const pdf = new jsPDF({
                orientation: w > h ? 'landscape' : 'portrait',
                unit: 'px',
                format: [w, h]
            });

            for (let i = 0; i < pm.pages.length; i++) {
                // Load page data
                await this.cm.loadProject(pm.pages[i].data);

                // Prepare for export
                const originalStroke = this.cm.workspace.stroke;
                const originalShadow = this.cm.workspace.shadow;
                this.cm.workspace.set({ stroke: 'transparent', shadow: null });

                const guides = this.canvas.getObjects().filter(obj => obj.excludeFromExport);
                guides.forEach(g => g.set({ opacity: 0 }));

                const originalVPT = this.canvas.viewportTransform.slice();
                this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

                const originalCanvasBg = this.canvas.backgroundColor;
                const originalWorkspaceFill = this.cm.workspace.fill;
                const isTransparent = this._isTransparentFill(originalWorkspaceFill);

                this.canvas.backgroundColor = 'transparent';
                if (isTransparent) this.cm.workspace.set({ fill: '#ffffff' });

                const dataURL = this.canvas.toDataURL({
                    format: 'png',
                    multiplier,
                    left: 0, top: 0,
                    width: w, height: h,
                    enableRetinaScaling: false
                });

                if (i > 0) pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
                pdf.addImage(dataURL, 'PNG', 0, 0, w, h);

                // Restore
                this.canvas.backgroundColor = originalCanvasBg;
                this.cm.workspace.set({ fill: originalWorkspaceFill, stroke: originalStroke, shadow: originalShadow });
                this.canvas.setViewportTransform(originalVPT);
                guides.forEach(g => g.set({ opacity: 1 }));
            }

            pdf.save(`${filename}.pdf`);

            // Restore original page
            await this.cm.loadProject(pm.pages[originalIndex].data);
            pm.currentPageIndex = originalIndex;

            NotificationManager.success(`Exported ${pm.pages.length} pages as PDF`);
        } catch (err) {
            console.error('Multi-page PDF export failed:', err);
            NotificationManager.error('Multi-page PDF export failed');
        }
    }

    exportProject() {
        const json = this.cm.saveProject();
        json.timestamp = Date.now();

        const jsonString = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `project-${timestamp}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
