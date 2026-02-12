import { describe, it, expect } from 'vitest';
import ColorService from '../services/ColorService';

describe('ColorService', () => {
    describe('rgbToHex', () => {
        it('should convert black', () => {
            expect(ColorService.rgbToHex(0, 0, 0)).toBe('#000000');
        });

        it('should convert white', () => {
            expect(ColorService.rgbToHex(255, 255, 255)).toBe('#ffffff');
        });

        it('should convert red', () => {
            expect(ColorService.rgbToHex(255, 0, 0)).toBe('#ff0000');
        });

        it('should convert green', () => {
            expect(ColorService.rgbToHex(0, 255, 0)).toBe('#00ff00');
        });

        it('should convert blue', () => {
            expect(ColorService.rgbToHex(0, 0, 255)).toBe('#0000ff');
        });

        it('should pad single digit hex values', () => {
            expect(ColorService.rgbToHex(1, 2, 3)).toBe('#010203');
        });
    });
});
