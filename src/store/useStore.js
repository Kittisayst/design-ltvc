import { create } from 'zustand';

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

    // Sidebar State
    leftSidebarOpen: true,
    setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
    toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
    rightSidebarOpen: true,
    setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
    toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),

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

    // History State (replaces window CustomEvent 'historyUpdate')
    canUndo: false,
    canRedo: false,
    historyLabel: '',
    setHistoryState: ({ canUndo, canRedo, label }) => set({ canUndo, canRedo, historyLabel: label }),

    // Theme State
    theme: localStorage.getItem('app-theme') || 'dark',
    setTheme: (theme) => {
        localStorage.setItem('app-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
    },
    toggleTheme: () => set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('app-theme', next);
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
    }),
}));
