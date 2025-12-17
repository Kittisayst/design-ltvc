
export class PropertyPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
    }

    init() {
        this.setupBindings();

        // Subscribe to Zoom changes
        if (this.cm.onZoomChange) {
            this.cm.onZoomChange((zoom) => {
                const percent = Math.round(zoom * 100) + '%';
                const el = document.getElementById('zoom-level');
                if (el) el.textContent = percent;
            });
        }
    }

    setupBindings() {
        // Helper for Color Picker
        const setupPicker = (pickerId, swatchId, wrapperId, onColorChange) => {
            const picker = document.getElementById(pickerId);
            const swatch = document.getElementById(swatchId);
            const wrapper = document.getElementById(wrapperId);

            if (picker && swatch && wrapper) {
                // Toggle picker
                swatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = wrapper.style.display === 'block';
                    // Hide all other pickers
                    document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none');
                    wrapper.style.display = isVisible ? 'none' : 'block';
                    console.log(`Toggled picker ${pickerId}: ${!isVisible}`);
                });

                // Handle Change
                picker.addEventListener('color-changed', (e) => {
                    const color = e.detail.value;
                    swatch.style.backgroundColor = color;
                    console.log(`Color changed for ${pickerId}: ${color}`);
                    onColorChange(color);
                });

                // Close on click outside
                document.addEventListener('click', (e) => {
                    if (!wrapper.contains(e.target) && !swatch.contains(e.target)) {
                        wrapper.style.display = 'none';
                    }
                });
            } else {
                console.error(`Failed to setup picker: ${pickerId}. Missing elements: picker=${!!picker}, swatch=${!!swatch}, wrapper=${!!wrapper}`);
            }
        };

        // Zoom Controls
        const bindClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };

        bindClick('btn-zoom-in', () => this.cm.zoomIn());
        bindClick('btn-zoom-out', () => this.cm.zoomOut());
        bindClick('btn-zoom-reset', () => this.cm.resetZoom());

        // Resize
        const btnResize = document.getElementById('btn-resize');
        if (btnResize) {
            btnResize.addEventListener('click', () => {
                this.cm.resize(parseInt(this.dom.widthInput.value), parseInt(this.dom.heightInput.value));
            });
        }

        // Lock
        if (this.dom.btnLock) {
            this.dom.btnLock.addEventListener('click', () => {
                this.cm.toggleLockActiveObject();
            });
        }

        // Properties Inputs (Two-way)
        const props = ['propX', 'propY', 'propW', 'propH', 'propAngle'];
        props.forEach(p => {
            if (this.dom[p]) {
                this.dom[p].addEventListener('input', () => {
                    let propName = '';
                    if (p === 'propX') propName = 'left';
                    else if (p === 'propY') propName = 'top';
                    else if (p === 'propW') propName = 'width';
                    else if (p === 'propH') propName = 'height';
                    else if (p === 'propAngle') propName = 'angle';

                    this.cm.updateActiveObject(propName, parseInt(this.dom[p].value));
                });
            }
        });

        // Alignment Buttons
        bindClick('btn-page-left', () => this.cm.alignActiveObject('left'));
        bindClick('btn-page-center', () => this.cm.alignActiveObject('center'));
        bindClick('btn-page-right', () => this.cm.alignActiveObject('right'));
        bindClick('btn-page-top', () => this.cm.alignActiveObject('top'));
        bindClick('btn-page-middle', () => this.cm.alignActiveObject('middle'));
        bindClick('btn-page-bottom', () => this.cm.alignActiveObject('bottom'));

        // Align Elements
        bindClick('btn-elem-left', () => this.cm.alignSelection('left'));
        bindClick('btn-elem-center', () => this.cm.alignSelection('center'));
        bindClick('btn-elem-right', () => this.cm.alignSelection('right'));
        bindClick('btn-elem-top', () => this.cm.alignSelection('top'));
        bindClick('btn-elem-middle', () => this.cm.alignSelection('middle'));
        bindClick('btn-elem-bottom', () => this.cm.alignSelection('bottom'));

        // Layering
        bindClick('btn-layer-up', () => this.cm.layerActiveObject('up'));
        bindClick('btn-layer-down', () => this.cm.layerActiveObject('down'));

        // Flip
        bindClick('btn-flip-h', () => this.cm.flipActiveObject('horizontal'));
        bindClick('btn-flip-v', () => this.cm.flipActiveObject('vertical'));

        // Duplicate
        bindClick('btn-duplicate', () => this.cm.duplicateActiveObject());


        // Background Logic
        const updateBg = () => {
            const type = this.dom.bgType.value;
            if (type === 'solid') {
                document.getElementById('bg-solid-controls').style.display = 'flex';
                document.getElementById('bg-gradient-controls').style.display = 'none';
                // Handled by setupPicker callback below for color
            } else {
                document.getElementById('bg-solid-controls').style.display = 'none';
                document.getElementById('bg-gradient-controls').style.display = 'flex';
                const start = document.getElementById('bg-grad-start').value;
                const end = document.getElementById('bg-grad-end').value;
                const dir = document.getElementById('bg-grad-dir').value;
                this.cm.setBackgroundGradient(start, end, dir, this.cm.canvas.width, this.cm.canvas.height);
            }
        };

        if (this.dom.bgType) {
            this.dom.bgType.addEventListener('change', updateBg);
            document.getElementById('bg-grad-start').addEventListener('input', updateBg);
            document.getElementById('bg-grad-end').addEventListener('input', updateBg);
            document.getElementById('bg-grad-dir').addEventListener('change', updateBg);
        }

        // Init Custom Pickers
        setupPicker('bg-color-picker', 'bg-color-swatch', 'bg-color-picker-wrap', (color) => {
            this.cm.setBackgroundColor(color);
        });

        setupPicker('elem-color-picker', 'elem-color-swatch', 'elem-color-picker-wrap', (color) => {
            this.cm.updateActiveObject('fill', color);
        });

        setupPicker('text-color-picker', 'text-color-swatch', 'text-color-picker-wrap', (color) => {
            this.cm.setTextStyle('fill', color);
        });

        // Text Logic
        if (this.dom.fontFamily) {
            this.dom.fontFamily.addEventListener('change', () => this.cm.setTextStyle('fontFamily', this.dom.fontFamily.value));
            // Removed old textColor input listener
            this.dom.textSize.addEventListener('input', () => this.cm.setTextStyle('fontSize', parseInt(this.dom.textSize.value, 10)));

            this.dom.btnBold.addEventListener('click', () => {
                this.cm.toggleTextDecoration('fontWeight');
                this.updateTextButtons(this.cm.getActiveObject());
            });
            this.dom.btnItalic.addEventListener('click', () => {
                this.cm.toggleTextDecoration('fontStyle');
                this.updateTextButtons(this.cm.getActiveObject());
            });
            this.dom.btnUnderline.addEventListener('click', () => {
                this.cm.toggleTextDecoration('underline');
                this.updateTextButtons(this.cm.getActiveObject());
            });
        }
    }

    updateTextButtons(activeObj) {
        if (!activeObj || activeObj.type !== 'i-text') return;
        if (this.dom.btnBold) activeObj.fontWeight === 'bold' ? this.dom.btnBold.classList.add('active') : this.dom.btnBold.classList.remove('active');
        if (this.dom.btnItalic) activeObj.fontStyle === 'italic' ? this.dom.btnItalic.classList.add('active') : this.dom.btnItalic.classList.remove('active');
        if (this.dom.btnUnderline) activeObj.underline ? this.dom.btnUnderline.classList.add('active') : this.dom.btnUnderline.classList.remove('active');
    }

    updateControls(activeObj) {
        if (!activeObj) {
            if (this.dom.posControls) this.dom.posControls.style.display = 'none';
            if (this.dom.textControls) this.dom.textControls.style.display = 'none';
            return;
        }

        if (this.dom.posControls) this.dom.posControls.style.display = 'block';

        // Advanced Props
        if (this.dom.propX) this.dom.propX.value = Math.round(activeObj.left);
        if (this.dom.propY) this.dom.propY.value = Math.round(activeObj.top);
        if (this.dom.propW) this.dom.propW.value = Math.round(activeObj.getScaledWidth());
        if (this.dom.propH) this.dom.propH.value = Math.round(activeObj.getScaledHeight());
        if (this.dom.propAngle) this.dom.propAngle.value = Math.round(activeObj.angle);

        // Object Color sync (Custom Picker)
        const picker = document.getElementById('elem-color-picker');
        const swatch = document.getElementById('elem-color-swatch');

        if (picker && swatch) {
            let val = activeObj.fill;
            // Handle filter for images
            if (activeObj.type === 'image' && activeObj.filters && activeObj.filters.length) {
                const filter = activeObj.filters.find(f => f.type === 'BlendColor');
                if (filter) val = filter.color;
            }
            // If gradient/pattern, might default or ignore
            if (typeof val === 'string' && val.startsWith('#')) {
                picker.color = val;
                swatch.style.backgroundColor = val;
            }
        }

        // Lock State
        if (this.dom.btnLock) {
            if (activeObj.lockMovementX) this.dom.btnLock.classList.add('active');
            else this.dom.btnLock.classList.remove('active');
        }

        // Text Props
        if (activeObj.type === 'i-text') {
            if (this.dom.textControls) this.dom.textControls.style.display = 'flex';

            if (this.dom.fontFamily) this.dom.fontFamily.value = activeObj.fontFamily;
            // if (this.dom.textColor) this.dom.textColor.value = activeObj.fill; // Old input

            // Text Color Sync
            const tPicker = document.getElementById('text-color-picker');
            const tSwatch = document.getElementById('text-color-swatch');
            if (tPicker && tSwatch) {
                tPicker.color = activeObj.fill;
                tSwatch.style.backgroundColor = activeObj.fill;
            }

            if (this.dom.textSize) this.dom.textSize.value = activeObj.fontSize;

            this.updateTextButtons(activeObj);
        } else {
            if (this.dom.textControls) this.dom.textControls.style.display = 'none';
        }

        // Multi-selection check for Alignment UI
        const isMulti = activeObj.type === 'activeSelection' || (activeObj._objects && activeObj._objects.length > 1);
        if (isMulti) {
            if (this.dom.alignPage) this.dom.alignPage.style.display = 'none';
            if (this.dom.alignElem) this.dom.alignElem.style.display = 'flex';
        } else {
            if (this.dom.alignPage) this.dom.alignPage.style.display = 'flex';
            if (this.dom.alignElem) this.dom.alignElem.style.display = 'none';
        }
    }
}
