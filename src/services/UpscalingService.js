import Upscaler from 'upscaler';

/**
 * Service to handle AI-powered image upscaling using UpscalerJS.
 */
const UpscalingService = {
    upscaler: null,

    /**
     * Initializes the Upscaler instance.
     */
    init: () => {
        if (!UpscalingService.upscaler) {
            UpscalingService.upscaler = new Upscaler({
                // Default settings will use the 2x model from CDN
            });
        }
    },

    /**
     * Upscales an image.
     * @param {string | HTMLImageElement} imageSource - The image URL or HTMLImageElement.
     * @param {Object} options - Upscaling options (progress callback, etc.)
     * @returns {Promise<string>} - The upscaled image as a DataURL.
     */
    upscale: async (imageSource, options = {}) => {
        UpscalingService.init();

        try {
            // If it's a URL, we might need to load it into an image first to ensure crossOrigin
            let img = imageSource;
            if (typeof imageSource === 'string') {
                img = await new Promise((resolve, reject) => {
                    const i = new Image();
                    i.crossOrigin = 'Anonymous';
                    i.onload = () => resolve(i);
                    i.onerror = reject;
                    i.src = imageSource;
                });
            }

            const result = await UpscalingService.upscaler.upscale(img, {
                patchSize: 64, // Smaller patches for browser performance
                padding: 2,
                ...options
            });

            return result;
        } catch (error) {
            console.error('Upscaling failed:', error);
            throw error;
        }
    }
};

export default UpscalingService;
