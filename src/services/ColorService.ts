import ColorThief from 'colorthief';

export interface ColorResult {
    dominant: string;
    palette: string[];
}

/**
 * Service to handle color extraction from images.
 */
const ColorService = {
    /**
     * Extracts the dominant color and a palette of colors from an image.
     */
    extractColors: async (imageSource: string | HTMLImageElement, colorCount: number = 6): Promise<ColorResult> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                try {
                    const colorThief = new (ColorThief as any)();
                    const dominantRGB: [number, number, number] = colorThief.getColor(img);
                    const paletteRGB: [number, number, number][] = colorThief.getPalette(img, colorCount);

                    const dominant = ColorService.rgbToHex(dominantRGB[0], dominantRGB[1], dominantRGB[2]);
                    const palette = paletteRGB.map(rgb => ColorService.rgbToHex(rgb[0], rgb[1], rgb[2]));

                    resolve({ dominant, palette });
                } catch (error) {
                    console.error('Color extraction failed:', error);
                    reject(error);
                }
            };

            img.onerror = (err) => {
                console.error('Failed to load image for color extraction:', err);
                reject(err);
            };

            // Set src after setting crossOrigin and onload
            img.src = typeof imageSource === 'string' ? imageSource : imageSource.src;
        });
    },

    /**
     * Converts RGB values to a HEX string.
     */
    rgbToHex: (r: number, g: number, b: number): string => {
        const toHex = (c: number): string => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
};

export default ColorService;
