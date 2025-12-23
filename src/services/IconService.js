/**
 * Service to interact with Iconify API for vector icons.
 */

const API_BASE = 'https://api.iconify.design';

export const IconService = {
    /**
     * Search for icons.
     * @param {string} query 
     * @param {number} limit 
     */
    searchIcons: async (query, limit = 50) => {
        try {
            const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) throw new Error('Icon search failed');
            const data = await response.json();
            return data.icons || [];
        } catch (error) {
            console.error('IconService Search Error:', error);
            return [];
        }
    },

    /**
     * Get raw SVG content for an icon.
     * @param {string} iconName - e.g. "mdi:home"
     */
    getIconSVG: async (iconName) => {
        try {
            // Iconify format: prefix:name -> URL: /prefix/name.svg
            const parts = iconName.split(':');
            if (parts.length !== 2) return null;

            const prefix = parts[0];
            const name = parts[1];

            const response = await fetch(`${API_BASE}/${prefix}/${name}.svg`);
            if (!response.ok) throw new Error('Failed to fetch SVG');
            return await response.text();
        } catch (error) {
            console.error('IconService SVG Error:', error);
            return null;
        }
    },

    /**
     * Helper to construct a preview URL.
     * @param {string} iconName 
     */
    getIconPreviewUrl: (iconName) => {
        const parts = iconName.split(':');
        if (parts.length !== 2) return '';
        return `${API_BASE}/${parts[0]}/${parts[1]}.svg`;
    }
};
