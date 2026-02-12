import ImageTracer from 'imagetracerjs';

interface TraceOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    scale?: number;
    simplifyTolerance?: number;
    roundcoords?: number;
    lcpr?: number;
    qcpr?: number;
    desc?: boolean;
    viewbox?: boolean;
}

/**
 * Service to handle client-side image vectorization (raster to SVG).
 */
const VectorizationService = {
    /**
     * Converts a raster image into a vectorized SVG string.
     */
    trace: async (source: string | HTMLImageElement | ImageData, options: TraceOptions = {}): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                // Default options tuned for quality vs performance
                const defaultOptions: TraceOptions = {
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
                (ImageTracer as any).imageToSVG(
                    source,
                    (svgString: string) => {
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
