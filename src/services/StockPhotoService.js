/**
 * Service to interact with Unsplash API for stock photos.
 */

const BASE_URL = 'https://api.unsplash.com';
const STORAGE_KEY = 'unsplash_access_key';
const DEFAULT_KEY = '2ImRn-jXTI2k3XM0W8xp4Szj9X889Z2KBA50D4qyt74';

export const StockPhotoService = {
    /**
     * Get the stored API key.
     */
    getApiKey: () => {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY;
    },

    /**
     * Save the API key.
     */
    setApiKey: (key) => {
        localStorage.setItem(STORAGE_KEY, key);
    },

    /**
     * Remove the stored API key.
     */
    removeApiKey: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Search for photos.
     * @param {string} query 
     * @param {number} page 
     * @param {number} perPage 
     */
    searchPhotos: async (query, page = 1, perPage = 20) => {
        const accessKey = StockPhotoService.getApiKey();
        if (!accessKey) throw new Error('No Access Key found');

        const response = await fetch(`${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Key might be invalid
                throw new Error('Invalid Access Key');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Trigger a download event (Required by Unsplash API Guidelines).
     * @param {string} downloadLocationUrl 
     */
    triggerDownload: async (downloadLocationUrl) => {
        const accessKey = StockPhotoService.getApiKey();
        if (!accessKey) return;

        try {
            await fetch(downloadLocationUrl, {
                headers: {
                    'Authorization': `Client-ID ${accessKey}`
                }
            });
        } catch (error) {
            console.error('Failed to trigger download event:', error);
        }
    }
};
