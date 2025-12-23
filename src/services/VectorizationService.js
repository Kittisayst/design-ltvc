import ImageTracer from 'imagetracerjs';

/**
 * Service to handle client-side image vectorization (raster to SVG).
 */
const VectorizationService = {
    /**
     * Converts a raster image into a vectorized SVG string.
     * @param {string | HTMLImageElement | ImageData} source - The image source.
     * @param {object} options - Options for ImageTracer.
     * @returns {Promise<string>} - The generated SVG string.
     */
    trace: async (source, options = {}) => {
        return new Promise((resolve, reject) => {
            try {
                // Default options tuned for quality vs performance
                const defaultOptions = {
                    ltres: 1,
                    qtres: 1,
                    pathomit: 8,
                    colorsampling: 1,
                    numberofcolors: 16,
                    mincolorratio: 0.02,
                    colorquantcycles: 3,
                    scale: 1,
                    simplifyTolerance: 0,
                    roundcoords: 1,
                    lcpr: 0,
                    qcpr: 0,
                    desc: false,
                    viewbox: true,
                    ...options
                };

                // ImageTracer is a bit legacy, uses callbacks
                ImageTracer.imageToSVG(
                    source,
                    (svgString) => {
                        if (svgString) {
                            resolve(svgString);
                        } else {
                            reject(new Error("Failed to generate SVG string"));
                        }
                    },
                    defaultOptions
                );
            } catch (error) {
                console.error('Vectorization failed:', error);
                reject(error);
            }
        });
    }
};

export default VectorizationService;
