import { createWorker } from 'tesseract.js';

/**
 * Service to handle text extraction from images (OCR) using Tesseract.js.
 * Supports Lao language and multiple other languages via the worker.
 */
const TextExtractionService = {
    /**
     * Extracts text from an image source.
     * @param {string | HTMLImageElement | Blob} imageSource - The image to process.
     * @param {string} langs - Language code(s) combined by '+', e.g., 'lao' or 'eng+lao'. Default is 'lao+eng'.
     * @param {Function} progressCallback - Optional callback for progress updates (0-1).
     * @returns {Promise<string>} - The extracted text.
     */
    extractText: async (imageSource, langs = 'lao+eng', progressCallback = null) => {
        let worker = null;
        try {
            worker = await createWorker(langs, 1, {
                logger: m => {
                    if (progressCallback && m.status === 'recognizing text') {
                        progressCallback(m.progress);
                    }
                    console.log(m); // Debug log for worker status
                }
            });

            const result = await worker.recognize(imageSource);
            return result.data.text;
        } catch (error) {
            console.error('OCR Failed:', error);
            throw error;
        } finally {
            if (worker) {
                await worker.terminate();
            }
        }
    }
};

export default TextExtractionService;
