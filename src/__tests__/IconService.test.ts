import { describe, it, expect } from 'vitest';
import { IconService } from '../services/IconService';

describe('IconService', () => {
    describe('getIconPreviewUrl', () => {
        it('should construct correct preview URL', () => {
            const url = IconService.getIconPreviewUrl('mdi:home');
            expect(url).toBe('https://api.iconify.design/mdi/home.svg');
        });

        it('should return empty string for invalid icon name', () => {
            expect(IconService.getIconPreviewUrl('invalid')).toBe('');
        });

        it('should handle different prefixes', () => {
            const url = IconService.getIconPreviewUrl('lucide:star');
            expect(url).toBe('https://api.iconify.design/lucide/star.svg');
        });
    });
});
