
export const propertyConfig = [
    {
        id: 'transform',
        title: 'Transform',
        // Apply to everything except background/null (unless we define a 'canvas' type later)
        shouldShow: (obj) => obj !== null,
        items: [
            {
                type: 'row',
                items: [
                    { label: 'X', type: 'number', prop: 'left', min: 0 },
                    { label: 'Y', type: 'number', prop: 'top', min: 0 }
                ]
            },
            {
                type: 'row',
                items: [
                    { label: 'W', type: 'number', prop: 'width', getter: (o) => Math.round(o.getScaledWidth()) },
                    { label: 'H', type: 'number', prop: 'height', getter: (o) => Math.round(o.getScaledHeight()) }
                ]
            },
            { label: 'Rotate', type: 'number', prop: 'angle' },
            {
                label: 'Align',
                type: 'actions',
                actions: [
                    { icon: 'align-left', title: 'Left', method: 'alignActiveObject', args: ['left'] },
                    { icon: 'align-center-horizontal', title: 'Center', method: 'alignActiveObject', args: ['center'] },
                    { icon: 'align-right', title: 'Right', method: 'alignActiveObject', args: ['right'] },
                    { icon: 'align-vertical-justify-start', title: 'Top', method: 'alignActiveObject', args: ['top'] },
                    { icon: 'align-vertical-justify-center', title: 'Middle', method: 'alignActiveObject', args: ['middle'] },
                    { icon: 'align-vertical-justify-end', title: 'Bottom', method: 'alignActiveObject', args: ['bottom'] }
                ]
            }
        ]
    },
    {
        id: 'text',
        title: 'Text Style',
        shouldShow: (obj) => obj && obj.type === 'i-text',
        items: [
            {
                label: 'Font',
                type: 'select',
                prop: 'fontFamily',
                options: [
                    // Google Fonts
                    { label: 'Roboto', value: 'Roboto' },
                    { label: 'Open Sans', value: 'Open Sans' },
                    { label: 'Lato', value: 'Lato' },
                    { label: 'Montserrat', value: 'Montserrat' },
                    { label: 'Oswald', value: 'Oswald' },
                    { label: 'Raleway', value: 'Raleway' },
                    { label: 'Playfair Display', value: 'Playfair Display' },
                    { label: 'Merriweather', value: 'Merriweather' },
                    { label: 'Poppins', value: 'Poppins' },
                    // Local / System
                    { label: 'Phetsarath OT (Lao)', value: "'Phetsarath OT', 'Noto Sans Lao', sans-serif" },
                    { label: 'Noto Sans Lao', value: "'Noto Sans Lao', sans-serif" },
                    { label: 'Noto Sans Lao Looped', value: "'Noto Sans Lao Looped', sans-serif" },
                    { label: 'Noto Serif Lao', value: "'Noto Serif Lao', sans-serif" },
                    { label: 'Inter', value: 'Inter' },
                    { label: 'Arial', value: 'Arial' },
                    { label: 'Times New Roman', value: 'Times New Roman' },
                    { label: 'Courier New', value: 'Courier New' }
                ]
            },
            {
                type: 'row',
                items: [
                    { label: 'Color', type: 'color', prop: 'fill' },
                    { label: 'Size', type: 'number', prop: 'fontSize' }
                ]
            },
            {
                // Alignment Controls
                type: 'actions',
                actions: [
                    { icon: 'align-left', title: 'Align Left', method: 'updateActiveObject', args: ['textAlign', 'left'], isActive: (o) => o.textAlign === 'left' },
                    { icon: 'align-center', title: 'Align Center', method: 'updateActiveObject', args: ['textAlign', 'center'], isActive: (o) => o.textAlign === 'center' },
                    { icon: 'align-right', title: 'Align Right', method: 'updateActiveObject', args: ['textAlign', 'right'], isActive: (o) => o.textAlign === 'right' },
                    { icon: 'align-justify', title: 'Justify', method: 'updateActiveObject', args: ['textAlign', 'justify'], isActive: (o) => o.textAlign === 'justify' }
                ]
            },
            {
                // Spacing Controls
                type: 'row',
                items: [
                    { label: 'Line Ht', type: 'number', prop: 'lineHeight', step: 0.1, min: 0.5 },
                    { label: 'Letter Sp', type: 'number', prop: 'charSpacing', step: 10 }
                ]
            },
            {
                // Sliders for Spacing (Visual feedback)
                type: 'row',
                items: [
                    { label: 'Line', type: 'range', prop: 'lineHeight', min: 0.8, max: 2.5, step: 0.1 },
                    { label: 'Char', type: 'range', prop: 'charSpacing', min: -50, max: 200, step: 10 }
                ]
            },
            {
                // Stroke Controls for Text
                type: 'row',
                items: [
                    { label: 'Stroke', type: 'color', prop: 'stroke', hasTransparent: true },
                    { label: 'Width', type: 'number', prop: 'strokeWidth', min: 0, step: 0.5 }
                ]
            },
            {
                type: 'actions', // Bold, Italic, Underline
                actions: [
                    {
                        icon: 'bold',
                        title: 'Bold',
                        method: 'toggleTextDecoration',
                        args: ['fontWeight'],
                        isActive: (o) => o.fontWeight === 'bold'
                    },
                    {
                        icon: 'italic',
                        title: 'Italic',
                        method: 'toggleTextDecoration',
                        args: ['fontStyle'],
                        isActive: (o) => o.fontStyle === 'italic'
                    },
                    {
                        icon: 'underline',
                        title: 'Underline',
                        method: 'toggleTextDecoration',
                        args: ['underline'],
                        isActive: (o) => !!o.underline
                    }
                ]
            }
        ]
    },
    {
        id: 'appearance',
        title: 'Appearance',
        // Show for shapes, groups, paths. Exclude images from generic fill unless we handle filters.
        shouldShow: (obj) => obj && (['rect', 'circle', 'triangle', 'polygon', 'path', 'group', 'activeSelection', 'activeselection'].includes(obj.type)),
        items: [
            { label: 'Fill', type: 'color', prop: 'fill', hasTransparent: true },
            { label: 'Stroke', type: 'color', prop: 'stroke', hasTransparent: true },
            {
                type: 'row',
                items: [
                    { label: 'Size', type: 'number', prop: 'strokeWidth', min: 0 },
                    {
                        label: 'Style',
                        type: 'select',
                        prop: 'strokeDashArray',
                        options: [
                            { label: 'Solid', value: null }, // null or empty array
                            { label: 'Dashed', value: [10, 5] },
                            { label: 'Dotted', value: [2, 2] }
                        ],
                        getter: (o) => {
                            const d = o.strokeDashArray;
                            if (!d || d.length === 0) return null; // Solid
                            if (d[0] < 5) return [2, 2]; // Match dotted roughly
                            return [10, 5]; // Match dashed
                        },
                        valueMatcher: (val, optValue) => {
                            // Custom matcher because arrays are reference types
                            if (!val && !optValue) return true;
                            if (val && optValue && val.toString() === optValue.toString()) return true;
                            return false;
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'shadow',
        title: 'Shadow',
        // Show for most objects except null/bg
        shouldShow: (obj) => obj && obj !== null && obj.type !== 'image', // Images might need different handling or work fine?
        items: [
            { label: 'Color', type: 'color', prop: 'shadow.color', hasTransparent: true },
            {
                type: 'row',
                items: [
                    { label: 'Blur', type: 'number', prop: 'shadow.blur', min: 0 },
                    { label: 'X', type: 'number', prop: 'shadow.offsetX' },
                    { label: 'Y', type: 'number', prop: 'shadow.offsetY' }
                ]
            }
        ]
    },
    {
        id: 'image-filters',
        title: 'Image Correction',
        shouldShow: (obj) => obj && (obj.type === 'image'),
        items: [
            {
                label: 'Actions',
                type: 'actions',
                actions: [
                    { title: 'Crop Image', icon: 'crop', method: 'startCropMode' } // activeObject is passed auto? No, need to check PropertyPanel logic
                ]
            },
            {
                label: 'Tint',
                type: 'color',
                prop: 'fill', // In our code we use 'fill' to trigger filter logic for images
                hasTransparent: true
            },
            { label: 'Brightness', type: 'range', prop: 'filter.brightness', min: -1, max: 1, step: 0.05 },
            { label: 'Contrast', type: 'range', prop: 'filter.contrast', min: -1, max: 1, step: 0.05 },
            { label: 'Blur', type: 'range', prop: 'filter.blur', min: 0, max: 1, step: 0.05 },
            { label: 'Saturation', type: 'range', prop: 'filter.saturation', min: -1, max: 1, step: 0.1 },
            { label: 'Hue', type: 'range', prop: 'filter.hue', min: -1, max: 1, step: 0.1 },
            { label: 'Noise', type: 'range', prop: 'filter.noise', min: 0, max: 100, step: 5 },
            { label: 'Pixelate', type: 'range', prop: 'filter.pixelate', min: 0, max: 20, step: 1 },
            {
                type: 'row',
                items: [
                    { label: 'Grayscale', type: 'number', prop: 'filter.grayscale', min: 0, max: 1, step: 1 }, // Toggle style?
                    { label: 'Sepia', type: 'number', prop: 'filter.sepia', min: 0, max: 1, step: 1 }
                ]
            }
        ]
    },
    {
        id: 'grouping',
        title: 'Grouping',
        shouldShow: (obj) => obj && (obj.type === 'activeSelection' || obj.type === 'activeselection' || obj.type === 'group'),
        items: [
            {
                type: 'actions',
                actions: [
                    {
                        title: 'Group Objects',
                        icon: 'group', // Check lucide icon name. 'group' might not exist. 'layers-2' or 'box-select'? 'combine'?
                        // Lucide has 'group' (user icon). 'layers' or 'box' is better. Let's use 'folder-plus' or just text?
                        // Actually 'group' in Lucide is usually 3 people.
                        // Let's use 'boxes' or 'layout-grid' or 'ungroup' -> 'layout-list'.
                        // Let's check available icons later. For now 'box-select' (if fails, squares).
                        icon: 'copy', // temporary fallback if unsure, but 'box-select' is standard-ish.
                        // Lucide: 'group' is people. 'boxes' (v0.x). 'package-plus'?
                        // Let's rely on standard names: 'layers' or 'folder' for Group.
                        // Ideally: Group = 'ungroup' (no), 'combine'.
                        // Let's use 'rectangle-horizontal' + 'plus'?
                        // Let's stick to 'folder' for Group, 'folder-open' for Ungroup.
                        icon: 'folder-plus',
                        label: 'Group',
                        method: 'group',
                        activeCheck: (obj) => obj.type !== 'activeSelection' && obj.type !== 'activeselection' // Disable if not selection? Logic handled by shouldShow.
                    },
                    {
                        title: 'Ungroup Objects',
                        icon: 'folder-minus',
                        label: 'Ungroup',
                        method: 'ungroup'
                    }
                ]
            }
        ]
    },
    {
        id: 'ordering',
        title: 'Order',
        shouldShow: (obj) => obj !== null,
        items: [
            {
                type: 'actions',
                actions: [
                    { title: 'Flip Horizontal', icon: 'arrow-left-right', method: 'flipActiveObject', args: ['horizontal'] },
                    { title: 'Flip Vertical', icon: 'arrow-up-down', method: 'flipActiveObject', args: ['vertical'] },
                    { title: 'Bring Forward', icon: 'arrow-up', method: 'layerActiveObject', args: ['up'] },
                    { title: 'Send Backward', icon: 'arrow-down', method: 'layerActiveObject', args: ['down'] },
                ]
            }
        ]
    },
    // crop-controls moved to Floating Toolbar
    {
        id: 'drawing',
        title: 'Drawing Tools',
        // Manual override in PropertyPanel
        shouldShow: (obj) => false,
        items: [
            {
                label: 'Brush Color',
                type: 'color',
                prop: 'freeDrawingBrush.color',
                hasTransparent: false
            },
            {
                label: 'Brush Size',
                type: 'range',
                prop: 'freeDrawingBrush.width',
                min: 1,
                max: 50,
                step: 1
            },
            {
                type: 'row',
                items: [
                    { label: 'Size Input', type: 'number', prop: 'freeDrawingBrush.width', min: 1, max: 100 }
                ]
            }
        ]
    }
];
