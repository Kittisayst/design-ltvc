import ColorThief from 'colorthief';

/**
 * Service to handle color extraction from images.
 */
const ColorService = {
    /**
     * Extracts the dominant color and a palette of colors from an image.
     * @param {string | HTMLImageElement} imageSource - The image URL or HTMLImageElement.
     * @param {number} colorCount - Number of colors to include in the palette.
     * @returns {Promise<{dominant: string, palette: string[]}>} - The extracted colors in HEX format.
     */
    extractColors: async (imageSource, colorCount = 6) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                try {
                    const colorThief = new ColorThief();
                    const dominantRGB = colorThief.getColor(img);
                    const paletteRGB = colorThief.getPalette(img, colorCount);

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
    rgbToHex: (r, g, b) => {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
};

export default ColorService;
