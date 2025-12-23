import * as imgly from '@imgly/background-removal';

/**
 * Service to handle client-side background removal.
 */
const BackgroundRemovalService = {
    /**
     * Removes the background from an image blob or URL.
     * @param {string | Blob} imageSource - The image URL or Blob.
     * @param {object} options - Optional configuration for @imgly/background-removal.
     * @returns {Promise<Blob>} - The processed image as a Blob.
     */
    removeBackground: async (imageSource, options = {}) => {
        try {
            // Validate library export
            // Some bundlers/versions export as default, others as named 'removeBackground'
            let removeBgFn = imgly.default || imgly.removeBackground || imgly;

            // If it is an object with 'removeBackground' property (common in CJS interop)
            if (typeof removeBgFn !== 'function' && removeBgFn.removeBackground) {
                removeBgFn = removeBgFn.removeBackground;
            }

            if (typeof removeBgFn !== 'function') {
                console.warn("Could not find removeBackground function in @imgly/background-removal exports. Exports:", imgly);
                // Last ditch attempt: if 'imgly' is the function itself (unlikely with star import but possible)
                if (typeof imgly === 'function') {
                    removeBgFn = imgly;
                } else {
                    throw new Error("Could not find removeBackground function in @imgly/background-removal exports");
                }
            }

            // Default configuration can be tuned here
            const config = {
                progress: (key, current, total) => {
                    // Optional: expose progress callback if needed
                    // console.log(`Downloading ${key}: ${current} of ${total}`);
                },
                ...options
            };

            const resultBlob = await removeBgFn(imageSource, config);
            return resultBlob;
        } catch (error) {
            console.error('Background removal failed:', error);
            throw error;
        }
    }
};

export default BackgroundRemovalService;
