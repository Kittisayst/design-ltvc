import { filters, FabricImage } from 'fabric';

export class FilterManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
    }

    applyImageFilter(obj, type, value) {
        if (!obj || !obj.filters) return;

        // Fabric filters mapping
        const filterMap = {
            'brightness': 'Brightness',
            'contrast': 'Contrast',
            'blur': 'Blur',
            'sharpen': 'Convolute', // Map sharpen to Convolute
            'saturation': 'Saturation',
            'grayscale': 'Grayscale',
            'sepia': 'Sepia',
            'hue': 'HueRotation',
            'noise': 'Noise',
            'pixelate': 'Pixelate',
            'tint': 'BlendColor'
        };

        const filterType = filterMap[type];
        if (!filterType) return;

        // Check if filter exists
        // For Convolute (sharpen), we need to distinguish it from other Convolutes if we had any?
        // But currently we only use Convolute for sharpen.
        let filter = obj.filters.find(f => f.type === filterType);

        if (!filter) {
            // Create new filter
            const FilterClass = filters[filterType];
            if (FilterClass) {
                let opts = {};
                // Constructor options logic
                if (type === 'blur') opts = { blur: value };
                else if (type === 'pixelate') opts = { blocksize: value };
                else if (type === 'hue') opts = { rotation: value };
                else if (type === 'tint') opts = { color: value, mode: 'multiply', alpha: 0.5 };
                else if (type === 'sharpen') {
                    // Initial matrix for 0 strength (identity)
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
            // Update existing (or just created)
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
                // Sharpen Matrix Calculation
                // value is roughly 0 to 1 (or more)
                // Matrix:
                // [ 0  -v  0 ]
                // [ -v 1+4v -v ]
                // [ 0  -v  0 ]

                if (value <= 0) {
                    shouldRemove = true;
                } else {
                    const v = value;
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

        obj.applyFilters();
        this.canvas.requestRenderAll();

    }
}

