import type { Canvas, FabricObject, Rect } from 'fabric';

/**
 * Shared type definitions for the core module.
 * CanvasManager is typed as an interface to avoid circular imports.
 */
export interface ICanvasManager {
    canvas: Canvas;
    workspace: FabricObject & Rect;
    originalWidth: number;
    originalHeight: number;

    // Managers
    historyManager: IHistoryManager;
    clipboardManager: { duplicate(): Promise<void>; copy(): Promise<void>; paste(): Promise<void> };
    filterManager: IFilterManager;
    fontManager: IFontManager;
    objectManager: IObjectManager;
    shapeManager: IShapeManager;

    // Methods
    getActiveObject(): FabricObject | null;
    saveProject(): Record<string, unknown>;
    loadProject(json: Record<string, unknown>): Promise<void>;
    replaceImage(active: FabricObject, src: string): Promise<void>;
    updateActiveObject(prop: string, value: unknown): void;
    selectionCallback?: ((obj: FabricObject | null) => void) | null;
    snapToGrid?: (obj: FabricObject) => void;
    handleObjectMoving?: (e: { target: FabricObject }) => void;
    clearGuidelines?: () => void;
}

export interface IHistoryManager {
    saveState(label?: string): void;
    undo(): Promise<void>;
    redo(): Promise<void>;
    canUndo(): boolean;
    canRedo(): boolean;
}

export interface IFilterManager {
    applyImageFilter(obj: FabricObject, type: string, value: number | string): void;
}

export interface IFontManager {
    loadGoogleFont(fontName: string): void;
    setTextStyle(prop: string, value: unknown): void;
    toggleTextDecoration(prop: string): unknown;
}

export interface IObjectManager {
    getActiveObject(): FabricObject | null;
    toggleLock(): void;
    reset(): void;
    remove(): void;
    flip(direction: 'horizontal' | 'vertical'): void;
    layer(direction: 'up' | 'down' | 'front' | 'back'): void;
    group(): void;
    ungroup(): Promise<void>;
}

export interface IShapeManager {
    addText(text?: string, options?: Record<string, unknown>): void;
    addImage(dataUrl: string, options?: Record<string, unknown>): Promise<void>;
    addShape(type: string, options?: Record<string, unknown>): void;
    addSVG(url: string, options?: Record<string, unknown>): Promise<void>;
    addSVGString(svgStr: string, options?: Record<string, unknown>): Promise<void>;
}
