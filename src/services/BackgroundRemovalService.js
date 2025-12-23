import { AutoModel, AutoProcessor, env, RawImage } from '@huggingface/transformers';

/**
 * Service to handle client-side background removal using Transformers.js.
 * Utilizes the RMBG-1.4 model which is state-of-the-art for general object background removal.
 */
const BackgroundRemovalService = {
    model: null,
    processor: null,
    modelId: 'briaai/RMBG-1.4',

    /**
     * Initializes the Transformers.js model and processor.
     */
    init: async () => {
        if (BackgroundRemovalService.model && BackgroundRemovalService.processor) return;

        try {
            console.log("[Transformers.js] Initializing Background Removal Service...");

            // Configure environment
            // Ensure we use the best available execution provider (WebGPU preferred if available)
            // env.backends.onnx.wasm.proxy = true; // Optional: depending on setup

            BackgroundRemovalService.model = await AutoModel.from_pretrained(BackgroundRemovalService.modelId, {
                // quantization: 'q8', // Optional: Use quantized model for smaller size/faster inference
                config: { model_type: 'custom' } // RMBG-1.4 often requires custom config handling
            });

            BackgroundRemovalService.processor = await AutoProcessor.from_pretrained(BackgroundRemovalService.modelId);

            console.log("[Transformers.js] Model and Processor initialized.");
        } catch (error) {
            console.error("[Transformers.js] Initialization failed:", error);
            throw error;
        }
    },

    /**
     * Removes the background from an image.
     * @param {string | Blob | HTMLImageElement} imageSource - The source image.
     * @returns {Promise<Blob>} - The processed image as a Blob.
     */
    removeBackground: async (imageSource) => {
        await BackgroundRemovalService.init();

        try {
            // 1. Prepare Input
            let img;
            if (typeof imageSource === 'string') {
                img = await RawImage.fromURL(imageSource);
            } else if (imageSource instanceof Blob) {
                img = await RawImage.fromBlob(imageSource);
            } else if (imageSource instanceof HTMLImageElement) {
                img = await RawImage.fromURL(imageSource.src);
            } else {
                throw new Error("Unsupported image source type");
            }

            // 2. Preprocess
            const { pixel_values } = await BackgroundRemovalService.processor(img);

            // 3. Inference
            const { output } = await BackgroundRemovalService.model({ input: pixel_values });

            // 4. Post-process (Get Mask)
            // output is usually [1, 1, 1024, 1024] or similar.
            // We strip batch/channel dims to get [H, W]
            const maskTensor = output[0].mul(255).to('uint8').squeeze();
            const maskHeight = maskTensor.dims[0];
            const maskWidth = maskTensor.dims[1];

            // Create Mask Canvas
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = maskWidth;
            maskCanvas.height = maskHeight;
            const maskCtx = maskCanvas.getContext('2d');

            // Put mask data manually
            const maskData = maskTensor.data; // Flat Uint8Array
            const rgbaData = new Uint8ClampedArray(maskWidth * maskHeight * 4);

            for (let i = 0; i < maskData.length; i++) {
                const val = maskData[i];
                const rgbaIndex = i * 4;
                rgbaData[rgbaIndex] = 0;     // R
                rgbaData[rgbaIndex + 1] = 0; // G
                rgbaData[rgbaIndex + 2] = 0; // B
                rgbaData[rgbaIndex + 3] = val; // A
            }

            const maskImageData = new ImageData(rgbaData, maskWidth, maskHeight);
            maskCtx.putImageData(maskImageData, 0, 0);

            // 5. Composite logic
            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            const originalCtx = originalCanvas.getContext('2d');

            // Re-create an Image element for generic drawing
            const originalImg = new Image();
            originalImg.crossOrigin = "anonymous";
            if (imageSource instanceof HTMLImageElement) {
                originalImg.src = imageSource.src;
            } else if (typeof imageSource === 'string') {
                originalImg.src = imageSource;
            } else { // Blob
                originalImg.src = URL.createObjectURL(imageSource);
            }

            await new Promise((resolve, reject) => {
                originalImg.onload = resolve;
                originalImg.onerror = reject;
            });

            originalCtx.drawImage(originalImg, 0, 0);

            // Draw mask onto original canvas, scaled to fit
            originalCtx.globalCompositeOperation = 'destination-in';
            originalCtx.drawImage(maskCanvas, 0, 0, originalCanvas.width, originalCanvas.height);

            // Cleanup
            if (imageSource instanceof Blob) {
                URL.revokeObjectURL(originalImg.src);
            }

            // Return Blob
            return new Promise(resolve => originalCanvas.toBlob(resolve, 'image/png'));

        } catch (error) {
            console.error("[Transformers.js] Background removal failed:", error);
            throw error;
        }
    }
};

export default BackgroundRemovalService;
