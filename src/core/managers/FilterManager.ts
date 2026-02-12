import { filters, FabricObject } from 'fabric';
import type { ICanvasManager } from '../types';

type FilterType = 'brightness' | 'contrast' | 'blur' | 'sharpen' | 'saturation' | 'grayscale' | 'sepia' | 'hue' | 'noise' | 'pixelate' | 'tint';

const FILTER_MAP: Record<FilterType, string> = {
    'brightness': 'Brightness',
    'contrast': 'Contrast',
    'blur': 'Blur',
    'sharpen': 'Convolute',
    'saturation': 'Saturation',
    'grayscale': 'Grayscale',
    'sepia': 'Sepia',
    'hue': 'HueRotation',
    'noise': 'Noise',
    'pixelate': 'Pixelate',
    'tint': 'BlendColor'
};

export class FilterManager {
    private canvasManager: ICanvasManager;

    constructor(canvasManager: ICanvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
    }

    applyImageFilter(obj: FabricObject & { filters?: any[]; applyFilters?: () => void }, type: FilterType, value: number | string): void {
        if (!obj || !obj.filters) return;

        const filterType = FILTER_MAP[type];
        if (!filterType) return;

        let filter = obj.filters.find((f: any) => f.type === filterType);

        if (!filter) {
            const FilterClass = (filters as any)[filterType];
            if (FilterClass) {
                let opts: Record<string, any> = {};
                if (type === 'blur') opts = { blur: value };
                else if (type === 'pixelate') opts = { blocksize: value };
                else if (type === 'hue') opts = { rotation: value };
                else if (type === 'tint') opts = { color: value, mode: 'multiply', alpha: 0.5 };
                else if (type === 'sharpen') {
                    opts = { matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0] };
                }
                else {
                    opts[type] = value;
                }

                filter = new FilterClass(opts);
                obj.filters.push(filter);
            }
        }

        if (filter) {
            let shouldRemove = false;

            if (type === 'blur') {
                filter.blur = value;
                if (value === 0) shouldRemove = true;
            }
            else if (type === 'pixelate') {
                filter.blocksize = value;
                if (value === 0) shouldRemove = true;
            }
            else if (type === 'hue') {
                filter.rotation = value;
                if (value === 0) shouldRemove = true;
            }
            else if (type === 'grayscale' || type === 'sepia') {
                if (value === 0) shouldRemove = true;
            }
            else if (type === 'tint') {
                filter.color = value;
                if (!value || value === 'transparent' || value === 'rgba(0,0,0,0)') shouldRemove = true;
            }
            else if (type === 'noise') {
                filter.noise = value;
                if (value === 0) shouldRemove = true;
            }
            else if (type === 'sharpen') {
                if ((value as number) <= 0) {
                    shouldRemove = true;
                } else {
                    const v = value as number;
                    filter.matrix = [
                        0, -v, 0,
                        -v, 1 + 4 * v, -v,
                        0, -v, 0
                    ];
                }
            }
            else {
                filter[type] = value;
                if (value === 0) shouldRemove = true;
            }

            if (shouldRemove) {
                const idx = obj.filters.indexOf(filter);
                if (idx > -1) obj.filters.splice(idx, 1);
            }
        }

        if (obj.applyFilters) obj.applyFilters();
        this.canvas.requestRenderAll();
    }
}
