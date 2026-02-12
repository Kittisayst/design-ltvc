import { IText, Path } from 'fabric';

/**
 * Generates SVG path data for various text-on-path shapes.
 */
function generatePathData(type, options = {}) {
    const { width = 300, height = 150, radius = 150 } = options;

    switch (type) {
        case 'arc': {
            // Semi-circle arc
            const r = radius;
            const startX = 0;
            const startY = r;
            const endX = r * 2;
            const endY = r;
            return `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
        }
        case 'arc-down': {
            const r = radius;
            return `M 0 0 A ${r} ${r} 0 0 0 ${r * 2} 0`;
        }
        case 'circle': {
            const r = radius;
            const cx = r;
            const cy = r;
            return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`;
        }
        case 'wave': {
            const w = width;
            const h = height / 3;
            return `M 0 ${h} Q ${w * 0.25} 0 ${w * 0.5} ${h} Q ${w * 0.75} ${h * 2} ${w} ${h}`;
        }
        case 'wave-deep': {
            const w = width;
            const h = height / 2;
            return `M 0 ${h} Q ${w * 0.25} ${-h * 0.5} ${w * 0.5} ${h} Q ${w * 0.75} ${h * 2.5} ${w} ${h}`;
        }
        default:
            return `M 0 0 L ${width} 0`; // straight line fallback
    }
}

export class TextOnPathManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
    }

    get canvas() { return this.cm.canvas; }

    /**
     * Add text on a path to the canvas.
     * @param {string} text - The text content.
     * @param {string} pathType - 'arc' | 'arc-down' | 'circle' | 'wave' | 'wave-deep'
     * @param {object} options - { fontSize, fill, fontFamily, radius, width, height }
     */
    addTextOnPath(text = 'Text on Path', pathType = 'arc', options = {}) {
        const {
            fontSize = 28,
            fill = '#333333',
            fontFamily = "'Phetsarath OT', 'Noto Sans Lao', sans-serif",
            radius = 150,
            width = 300,
            height = 150,
        } = options;

        const pathData = generatePathData(pathType, { radius, width, height });
        const path = new Path(pathData, {
            visible: false,
            selectable: false,
            evented: false,
        });

        const fabricText = new IText(text, {
            left: 100,
            top: 100,
            fontSize,
            fill,
            fontFamily,
            path,
            selectable: true,
            evented: true,
            objectCaching: true,
        });

        this.canvas.add(fabricText);
        this.canvas.setActiveObject(fabricText);
        this.canvas.requestRenderAll();

        if (this.cm.historyManager) {
            this.cm.historyManager.saveState('Text on Path');
        }

        return fabricText;
    }

    /**
     * Get available path types.
     */
    static getPathTypes() {
        return [
            { id: 'arc', label: 'Arc Up' },
            { id: 'arc-down', label: 'Arc Down' },
            { id: 'circle', label: 'Circle' },
            { id: 'wave', label: 'Wave' },
            { id: 'wave-deep', label: 'Deep Wave' },
        ];
    }
}
