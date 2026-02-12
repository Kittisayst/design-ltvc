import { createWorker } from 'tesseract.js';

/**
 * Service to handle text extraction from images (OCR) using Tesseract.js.
 * Supports Lao language and multiple other languages via the worker.
 */
const TextExtractionService = {
    /**
     * Extracts text from an image source.
     */
    extractText: async (
        imageSource: string | HTMLImageElement | Blob,
        langs: string = 'lao+eng',
        progressCallback: ((progress: number) => void) | null = null
    ): Promise<string> => {
        let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
        try {
            worker = await createWorker(langs, 1, {
                logger: (m: any) => {
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
