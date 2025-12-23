import { create } from 'zustand';
import { temporal } from 'zundo';

export const useStore = create((set) => ({
    // UI State
    activeTab: 'elements',
    setActiveTab: (tab) => set({ activeTab: tab }),

    showRulers: true,
    setShowRulers: (visible) => set({ showRulers: visible }),

    showShortcuts: false,
    setShowShortcuts: (visible) => set({ showShortcuts: visible }),

    showExport: false,
    setShowExport: (visible) => set({ showExport: visible }),

    showResize: false,
    setShowResize: (visible) => set({ showResize: visible }),

    // Color Picker State
    colorPickerVisible: false,
    setColorPickerVisible: (visible) => set({ colorPickerVisible: visible }),
    colorPickerAnchor: null,
    setColorPickerAnchor: (anchor) => set({ colorPickerAnchor: anchor }),
    activeColorProp: 'fill',
    setActiveColorProp: (prop) => set({ activeColorProp: prop }),
    colorPickerAlign: 'left',
    setColorPickerAlign: (align) => set({ colorPickerAlign: align }),

    // Extracted Palette State
    extractedPalette: null,
    setExtractedPalette: (palette) => set({ extractedPalette: palette }),
}));
