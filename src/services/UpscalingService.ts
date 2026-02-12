import Upscaler from 'upscaler';

interface UpscaleOptions {
    patchSize?: number;
    padding?: number;
    progress?: (progress: number) => void;
}

/**
 * Service to handle AI-powered image upscaling using UpscalerJS.
 */
const UpscalingService = {
    upscaler: null as InstanceType<typeof Upscaler> | null,

    /**
     * Initializes the Upscaler instance.
     */
    init: (): void => {
        if (!UpscalingService.upscaler) {
            UpscalingService.upscaler = new Upscaler({
                // Default settings will use the 2x model from CDN
            });
        }
    },

    /**
     * Upscales an image.
     */
    upscale: async (imageSource: string | HTMLImageElement, options: UpscaleOptions = {}): Promise<string> => {
        UpscalingService.init();

        try {
            // If it's a URL, we might need to load it into an image first to ensure crossOrigin
            let img: HTMLImageElement | string = imageSource;
            if (typeof imageSource === 'string') {
                img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const i = new Image();
                    i.crossOrigin = 'Anonymous';
                    i.onload = () => resolve(i);
                    i.onerror = reject;
                    i.src = imageSource;
                });
            }

            const result = await UpscalingService.upscaler!.upscale(img as HTMLImageElement, {
                patchSize: 64, // Smaller patches for browser performance
                padding: 2,
                ...options
            });

            return result as string;
        } catch (error) {
            console.error('Upscaling failed:', error);
            throw error;
        }
    }
};

export default UpscalingService;
