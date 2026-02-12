import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useStore.setState({
            activeTab: 'elements',
            showRulers: true,
            showShortcuts: false,
            showExport: false,
            showResize: false,
            colorPickerVisible: false,
            colorPickerAnchor: null,
            activeColorProp: 'fill',
            colorPickerAlign: 'left',
            extractedPalette: null,
            canUndo: false,
            canRedo: false,
            historyLabel: '',
            theme: 'dark',
        });
    });

    describe('UI State', () => {
        it('should set active tab', () => {
            useStore.getState().setActiveTab('templates');
            expect(useStore.getState().activeTab).toBe('templates');
        });

        it('should toggle rulers', () => {
            useStore.getState().setShowRulers(false);
            expect(useStore.getState().showRulers).toBe(false);
        });

        it('should toggle shortcuts modal', () => {
            useStore.getState().setShowShortcuts(true);
            expect(useStore.getState().showShortcuts).toBe(true);
        });

        it('should toggle export modal', () => {
            useStore.getState().setShowExport(true);
            expect(useStore.getState().showExport).toBe(true);
        });

        it('should toggle resize modal', () => {
            useStore.getState().setShowResize(true);
            expect(useStore.getState().showResize).toBe(true);
        });
    });

    describe('Color Picker State', () => {
        it('should toggle color picker visibility', () => {
            useStore.getState().setColorPickerVisible(true);
            expect(useStore.getState().colorPickerVisible).toBe(true);
        });

        it('should set active color prop', () => {
            useStore.getState().setActiveColorProp('stroke');
            expect(useStore.getState().activeColorProp).toBe('stroke');
        });

        it('should set color picker align', () => {
            useStore.getState().setColorPickerAlign('right');
            expect(useStore.getState().colorPickerAlign).toBe('right');
        });
    });

    describe('History State', () => {
        it('should update history state', () => {
            useStore.getState().setHistoryState({
                canUndo: true,
                canRedo: false,
                label: 'Add Shape'
            });

            const state = useStore.getState();
            expect(state.canUndo).toBe(true);
            expect(state.canRedo).toBe(false);
            expect(state.historyLabel).toBe('Add Shape');
        });
    });

    describe('Theme State', () => {
        it('should toggle theme from dark to light', () => {
            useStore.getState().toggleTheme();
            expect(useStore.getState().theme).toBe('light');
        });

        it('should toggle theme from light back to dark', () => {
            useStore.getState().toggleTheme(); // dark -> light
            useStore.getState().toggleTheme(); // light -> dark
            expect(useStore.getState().theme).toBe('dark');
        });

        it('should set theme directly', () => {
            useStore.getState().setTheme('light');
            expect(useStore.getState().theme).toBe('light');
        });
    });

    describe('Extracted Palette', () => {
        it('should set extracted palette', () => {
            const palette = { dominant: '#ff0000', palette: ['#ff0000', '#00ff00'] };
            useStore.getState().setExtractedPalette(palette);
            expect(useStore.getState().extractedPalette).toEqual(palette);
        });
    });
});
