/**
 * Service to interact with Unsplash API for stock photos.
 */

const BASE_URL = 'https://api.unsplash.com';
const STORAGE_KEY = 'unsplash_access_key';
const DEFAULT_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

export interface UnsplashSearchResult {
    results: UnsplashPhoto[];
    total: number;
    total_pages: number;
}

export interface UnsplashPhoto {
    id: string;
    urls: { raw: string; full: string; regular: string; small: string; thumb: string };
    links: { download_location: string };
    alt_description: string | null;
    user: { name: string };
}

export const StockPhotoService = {
    /**
     * Get the stored API key.
     */
    getApiKey: (): string => {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY;
    },

    /**
     * Save the API key.
     */
    setApiKey: (key: string): void => {
        localStorage.setItem(STORAGE_KEY, key);
    },

    /**
     * Remove the stored API key.
     */
    removeApiKey: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Search for photos.
     */
    searchPhotos: async (query: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResult> => {
        const accessKey = StockPhotoService.getApiKey();
        if (!accessKey) throw new Error('No Access Key found');

        const response = await fetch(`${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid Access Key');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Trigger a download event (Required by Unsplash API Guidelines).
     */
    triggerDownload: async (downloadLocationUrl: string): Promise<void> => {
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
