import { FabricImage, loadSVGFromString, util, IText } from 'fabric';
import { NotificationManager } from '../NotificationManager.js';

// AI services are dynamically imported on first use to reduce initial bundle size

/**
 * Manages AI-powered features: vectorization, color extraction, upscaling, OCR.
 */
export class AIManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
    }

    get canvas() { return this.cm.canvas; }

    _getActiveImage() {
        const active = this.cm.getActiveObject();
        if (!active || (active.type !== 'image' && active.type !== 'fabric-image')) {
            return null;
        }
        return active;
    }

    /**
     * Vectorizes the currently active image and replaces it with a path-based group.
     */
    async vectorizeActiveImage() {
        const active = this._getActiveImage();
        if (!active) {
            NotificationManager.warning("Select an image to vectorize.");
            return;
        }

        NotificationManager.info("Vectorizing image. This may take a moment...");

        try {
            const src = active.getSrc();
            // 1. Trace image to SVG string
            const { default: VectorizationService } = await import('../../services/VectorizationService.js');
            const svgString = await VectorizationService.trace(src);

            // 2. Load SVG string into Fabric objects (Fabric 6 uses top-level async functions)
            const { objects, options } = await loadSVGFromString(svgString);
            const group = util.groupSVGElements(objects, options);

            // 3. Position and scale based on original image
            const originalMatrix = active.calcTransformMatrix();
            const qr = util.qrDecompose(originalMatrix);

            // Match original transform as closely as possible
            group.set({
                left: qr.translateX,
                top: qr.translateY,
                angle: qr.angle,
                scaleX: qr.scaleX * (active.width / group.width),
                scaleY: qr.scaleY * (active.height / group.height),
                flipX: qr.flipX,
                flipY: qr.flipY,
                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true
            });

            // 4. Swap objects
            this.canvas.add(group);
            this.canvas.remove(active);
            this.canvas.setActiveObject(group);
            this.canvas.requestRenderAll();

            this.cm.historyManager.saveState('Vectorize Image');
            NotificationManager.success("Image vectorized successfully!");
        } catch (error) {
            console.error("Vectorization failed:", error);
            NotificationManager.error("Failed to vectorize image.");
        }
    }

    /**
     * Extracts a color palette from the currently active image.
     * @returns {Promise<{dominant: string, palette: string[]}>}
     */
    async extractPaletteFromActiveImage() {
        const active = this._getActiveImage();
        if (!active) {
            NotificationManager.warning("Select an image to extract colors.");
            return null;
        }

        NotificationManager.info("Extracting color palette...");

        try {
            const src = active.getSrc();
            const { default: ColorService } = await import('../../services/ColorService.js');
            const result = await ColorService.extractColors(src);
            NotificationManager.success("Colors extracted!");
            return result;
        } catch (error) {
            console.error("Color extraction failed:", error);
            NotificationManager.error("Failed to extract colors.");
            return null;
        }
    }

    /**
     * Upscales the currently active image using AI.
     */
    async upscaleActiveImage() {
        const active = this._getActiveImage();
        if (!active) {
            NotificationManager.warning("Select an image to enhance.");
            return;
        }

        NotificationManager.info("Enhancing image quality. This may take a minute...");

        try {
            const src = active.getSrc();
            const { default: UpscalingService } = await import('../../services/UpscalingService.js');
            const enhancedSrc = await UpscalingService.upscale(src);

            await this.cm.replaceImage(active, enhancedSrc);

            this.cm.historyManager.saveState('Upscale Image');
            NotificationManager.success("Image enhanced successfully!");
        } catch (error) {
            console.error("Upscaling failed:", error);
            NotificationManager.error("Failed to enhance image.");
        }
    }

    /**
     * Extracts text from the currently active image using OCR.
     */
    async extractTextFromActiveImage() {
        const active = this._getActiveImage();
        if (!active) {
            NotificationManager.warning('Please select an image to extract text.');
            return;
        }

        try {
            NotificationManager.info('Scanning image for text... (Supports Lao/English)', 4000);

            const src = active.getSrc();
            // Use 'lao+eng' to support both languages
            const { default: TextExtractionService } = await import('../../services/TextExtractionService.js');
            const text = await TextExtractionService.extractText(src, 'lao+eng', (progress) => {
                console.log(`OCR Progress: ${Math.round(progress * 100)}%`);
            });

            if (!text || text.trim().length === 0) {
                NotificationManager.warning('No text found in the image.');
                return;
            }

            // Create a new IText object with the extracted text
            const textObject = new IText(text, {
                left: active.left + 20,
                top: active.top + 20,
                fontSize: 20,
                fontFamily: 'Phetsarath OT', // Default to Lao font
                fill: '#000000',
            });

            this.canvas.add(textObject);
            this.canvas.setActiveObject(textObject);
            this.canvas.renderAll();

            NotificationManager.success('Text extracted successfully!');
            return text;

        } catch (error) {
            console.error('Text extraction failed:', error);
            NotificationManager.error('Failed to extract text.');
            return null;
        }
    }
}
