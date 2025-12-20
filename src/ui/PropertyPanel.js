
import { propertyConfig } from '../config/propertyConfig.js';
import { createIcons, icons } from 'lucide';
import { HexColorPicker } from 'vanilla-colorful';
import { AdvancedColorPicker } from './AdvancedColorPicker.js';

export class PropertyPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
        this.container = document.getElementById('object-properties');
        this.currentObj = null;
    }

    init() {
        // We no longer rely on pre-cached DOM for properties.
        // We only handle global/background stuff here if needed.

        // Background Logic (Existing Static)
        this.initBackgroundControls();

        // Subscribe to Canvas Events
        this.cm.onSelectionChange((obj) => {
            this.currentObj = obj;
            this.render();
        });

        // Update values during drag
        this.cm.canvas.on('object:moving', () => this.updateValues());
        this.cm.canvas.on('object:scaling', () => this.updateValues());
        this.cm.canvas.on('object:rotating', () => this.updateValues());
        this.cm.canvas.on('object:resizing', () => this.updateValues());

        // Initial Render
        this.render();
    }

    initBackgroundControls() {
        const bgType = document.getElementById('bg-type');
        if (!bgType) return; // Maybe removed or not found

        const updateBg = () => {
            const type = bgType.value;
            const solidControls = document.getElementById('bg-solid-controls');
            const gradControls = document.getElementById('bg-gradient-controls');

            if (type === 'solid') {
                if (solidControls) solidControls.style.display = 'flex';
                if (gradControls) gradControls.style.display = 'none';
            } else {
                if (solidControls) solidControls.style.display = 'none';
                if (gradControls) gradControls.style.display = 'flex';
                const start = document.getElementById('bg-grad-start').value;
                const end = document.getElementById('bg-grad-end').value;
                const dir = document.getElementById('bg-grad-dir').value;
                this.cm.setBackgroundGradient(start, end, dir);
            }
        };

        bgType.addEventListener('change', updateBg);
        document.getElementById('bg-grad-start')?.addEventListener('input', updateBg);
        document.getElementById('bg-grad-end')?.addEventListener('input', updateBg);
        document.getElementById('bg-grad-dir')?.addEventListener('change', updateBg);

        // Color Picker for BG
        this.setupColorPicker('bg-color-picker', 'bg-color-swatch', 'bg-color-picker-wrap', (color) => {
            this.cm.setBackgroundColor(color);
        });
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        const isDrawing = this.cm.canvas.isDrawingMode;

        if (!this.currentObj && !isDrawing) {
            // Show nothing or maybe a "No selection" message?
            return;
        }

        // Generate Sections
        propertyConfig.forEach(section => {
            let show = false;
            // Mode-specific rendering
            if (isDrawing) {
                if (section.id === 'drawing') show = true;
            } else {
                if (section.id !== 'drawing' && section.shouldShow(this.currentObj)) show = true;
            }

            if (show) {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'section';

                if (section.title) {
                    const title = document.createElement('div');
                    title.className = 'section-title';
                    title.textContent = section.title;
                    sectionEl.appendChild(title);
                }

                section.items.forEach(item => {
                    sectionEl.appendChild(this.createField(item));
                });

                this.container.appendChild(sectionEl);
            }
        });

        // Re-init Icons
        createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 16, height: 16 } });

        // Initial Value Sync
        this.updateValues();
    }

    // ... createField stays same ... NOT! restoring it now.
    createField(item) {
        if (item.type === 'row') {
            const row = document.createElement('div');
            row.className = 'row';
            item.items.forEach(subItem => {
                const col = document.createElement('div');
                col.style.flex = 1;
                col.appendChild(this.createField(subItem));
                row.appendChild(col);
            });
            return row;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';

        if (item.label && item.type !== 'actions') {
            const label = document.createElement('label');
            label.textContent = item.label;
            wrapper.appendChild(label);
        }

        if (item.type === 'number') {
            const input = document.createElement('input');
            input.type = 'number';
            input.dataset.prop = item.prop;
            if (item.min !== undefined) input.min = item.min;
            if (item.max !== undefined) input.max = item.max;
            if (item.step !== undefined) input.step = item.step;

            input.addEventListener('input', () => {
                const val = parseFloat(input.value);
                this.updateObjectProperty(item, val);
            });
            wrapper.appendChild(input);
        }
        else if (item.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.prop = item.prop;
            input.addEventListener('input', () => {
                this.updateObjectProperty(item, input.value);
            });
            wrapper.appendChild(input);
        }
        else if (item.type === 'select') {
            const select = document.createElement('select');
            select.dataset.prop = item.prop;
            item.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value || '';
                if (opt.value === null) option.value = '__null__';
                option.textContent = opt.label;
                select.appendChild(option);
            });
            select.addEventListener('change', () => {
                let val = select.value;
                if (val === '__null__') val = null;
                else if (item.prop === 'strokeDashArray') {
                    // Specific logic for dash options
                    const selectedOpt = item.options.find(o => {
                        const v = o.value === null ? '__null__' : o.value;
                        return v == val;
                    });
                    if (selectedOpt) val = selectedOpt.value;
                }
                this.updateObjectProperty(item, val);
            });
            wrapper.appendChild(select);
        }
        else if (item.type === 'color') {
            const swatchId = `swatch-${item.prop}-${Math.random().toString(36).substr(2, 5)}`;
            const wrapId = `wrap-${item.prop}-${Math.random().toString(36).substr(2, 5)}`;

            const container = document.createElement('div');
            container.style.position = 'relative';

            container.innerHTML = `
                <div id="${swatchId}" class="color-swatch" style="background: #000; display:flex; align-items:center; justify-content:center;"></div>
                <div id="${wrapId}" class="color-picker-popup" style="width:auto; padding:12px;"></div>
            `;
            wrapper.appendChild(container);

            setTimeout(() => {
                const swatch = container.querySelector(`[id="${swatchId}"]`);
                const popup = container.querySelector(`[id="${wrapId}"]`);

                const advancedPicker = new AdvancedColorPicker({
                    color: '#000000',
                    onChange: (color) => {
                        this.updateObjectProperty(item, color);
                        swatch.style.background = color;
                    }
                });
                advancedPicker.mount(popup);

                swatch.dataset.pickerInstance = true;
                swatch._advancedPicker = advancedPicker;

                swatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = popup.style.display === 'block';
                    document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none');

                    if (!isVisible) {
                        popup.style.display = 'block';
                        popup.style.position = 'fixed';
                        popup.style.zIndex = '9999';
                        const rect = swatch.getBoundingClientRect();
                        const rightPos = window.innerWidth - rect.left + 8;
                        popup.style.left = 'auto';
                        popup.style.right = rightPos + 'px';

                        const popupHeight = 310;
                        if (rect.top + popupHeight > window.innerHeight - 20) {
                            popup.style.top = 'auto';
                            popup.style.bottom = (window.innerHeight - rect.bottom) + 'px';
                        } else {
                            popup.style.top = rect.top + 'px';
                            popup.style.bottom = 'auto';
                        }
                    } else {
                        popup.style.display = 'none';
                    }
                });

                if (!window._colorPickerGlobalEvents) {
                    window._colorPickerGlobalEvents = true;
                    const closeAll = () => { document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none'); };
                    window.addEventListener('scroll', closeAll, true);
                    window.addEventListener('resize', closeAll);
                }
                popup.addEventListener('click', (e) => e.stopPropagation());
            }, 0);
        }
        else if (item.type === 'actions') {
            const toolbar = document.createElement('div');
            toolbar.className = 'toolbar-row';
            item.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'icon-btn';
                if (action.label) {
                    btn.textContent = action.label;
                    btn.style.fontSize = '0.8rem';
                    btn.style.width = 'auto';
                    btn.style.padding = '0 8px';
                }
                if (action.icon) {
                    btn.innerHTML = `<i data-lucide="${action.icon}"></i> ${action.label || ''}`;
                }
                btn.title = action.title || '';

                btn.addEventListener('click', () => {
                    if (action.method && this.cm[action.method]) {
                        const args = action.args || [];
                        this.cm[action.method](...args);
                        this.updateValues();
                    }
                });
                toolbar.appendChild(btn);
            });
            wrapper.appendChild(toolbar);
        }
        else if (item.type === 'range') {
            const rangeContainer = document.createElement('div');
            rangeContainer.className = 'range-container';
            rangeContainer.style.display = 'flex';
            rangeContainer.style.alignItems = 'center';
            rangeContainer.style.gap = '8px';

            const input = document.createElement('input');
            input.type = 'range';
            input.dataset.prop = item.prop;
            if (item.min !== undefined) input.min = item.min;
            if (item.max !== undefined) input.max = item.max;
            if (item.step !== undefined) input.step = item.step;
            input.style.flex = '1';

            const valDisplay = document.createElement('span');
            valDisplay.className = 'range-val-display';
            valDisplay.style.minWidth = '32px';
            valDisplay.style.textAlign = 'right';
            valDisplay.style.fontSize = '0.8rem';
            valDisplay.textContent = '0';

            input.addEventListener('input', () => {
                valDisplay.textContent = input.value;
                this.updateObjectProperty(item, parseFloat(input.value));
            });

            rangeContainer.appendChild(input);
            rangeContainer.appendChild(valDisplay);
            wrapper.appendChild(rangeContainer);
        }

        return wrapper;
    }

    updateObjectProperty(item, value) {
        // Drawing Mode Handling
        if (item.prop.startsWith('freeDrawingBrush.')) {
            if (item.prop === 'freeDrawingBrush.color') this.cm.setBrushColor(value);
            if (item.prop === 'freeDrawingBrush.width') this.cm.setBrushWidth(value);
            return;
        }

        if (!this.currentObj) return;

        // Special handlers
        if (item.prop === 'fontFamily' || item.prop === 'fontSize' || item.prop === 'fontWeight') {
            // Text Styles might use setTextStyle
            this.cm.setTextStyle(item.prop, value);
        } else {
            this.cm.updateActiveObject(item.prop, value);
        }
    }

    updateValues() {
        const isDrawing = this.cm.canvas.isDrawingMode;
        if (!this.currentObj && !isDrawing) return;

        const obj = this.currentObj;

        // Helper for dot notation with optional drawing source
        const getVal = (o, p) => {
            // Drawing Override
            if (isDrawing && p.startsWith('freeDrawingBrush.')) {
                const brush = this.cm.canvas.freeDrawingBrush;
                if (!brush) return null;
                if (p === 'freeDrawingBrush.color') return brush.color;
                if (p === 'freeDrawingBrush.width') return brush.width;
            }

            if (!o) return null; // Fallback if no obj (and not drawing prop)

            if (p.includes('.')) {
                const parts = p.split('.');
                let current = o;
                for (const part of parts) {
                    if (current === null || current === undefined) return null;
                    current = current[part];
                }
                return current;
            }
            return o[p];
        };

        // Iterate all generated inputs
        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            const prop = input.dataset.prop;
            if (!prop) return;

            let val = getVal(obj, prop);

            // Normalize
            if (obj) {
                if (prop === 'width') val = Math.round(obj.getScaledWidth());
                else if (prop === 'height') val = Math.round(obj.getScaledHeight());
                else if (prop === 'left') val = Math.round(obj.left);
                else if (prop === 'top') val = Math.round(obj.top);
                else if (prop === 'angle') val = Math.round(obj.angle);
            }

            // Set value
            if (input.tagName === 'SELECT') {
                // Handle array values (strokeDashArray)
                if (prop === 'strokeDashArray' && obj) {
                    const dash = obj.strokeDashArray;
                    if (!dash || dash.length === 0) input.value = '__null__';
                    else if (dash[0] < 5) input.value = [2, 2].toString();
                    else input.value = [10, 5].toString();
                } else {
                    input.value = val;
                }
            } else if (input.type === 'number') {
                input.value = val === undefined ? '' : val;
            } else if (input.type === 'text') {
                input.value = val === undefined ? '' : val;
            } else if (input.type === 'range') {
                const defaultVal = input.getAttribute('min') || 0;
                input.value = val === undefined || val === null ? defaultVal : val;
                // Update display
                const display = input.nextElementSibling;
                if (display && display.classList.contains('range-val-display')) {
                    display.textContent = input.value;
                }
            }
        });

        // Update Color Swatches manually
        const swatches = this.container.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            // ID format: swatch-prop-random
            const parts = swatch.id.split('-');
            if (parts.length >= 3) {
                const prop = parts.slice(1, parts.length - 1).join('-');

                let val = getVal(obj, prop);

                if (val) {
                    swatch.style.background = val;
                    if (swatch._advancedPicker) {
                        swatch._advancedPicker.color = val;
                        // ...
                    }
                }
            }
        });

        // Update Buttons Active State
        const buttons = this.container.querySelectorAll('.toolbar-row button');
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon && obj) {
                const name = icon.getAttribute('data-lucide');
                let isActive = false;
                if (name === 'bold') isActive = obj.fontWeight === 'bold';
                if (name === 'italic') isActive = obj.fontStyle === 'italic';
                if (name === 'underline') isActive = !!obj.underline;

                if (isActive) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });
    }

    setupColorPicker(pickerId, swatchId, wrapperId, onColorChange) {
        const picker = document.getElementById(pickerId);
        const swatch = document.getElementById(swatchId);
        const wrapper = document.getElementById(wrapperId);

        if (picker && swatch && wrapper) {
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = wrapper.style.display === 'block';

                // Close others
                document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none');

                if (!isVisible) {
                    wrapper.style.display = 'block';

                    // Smart Positioning
                    const rect = wrapper.parentElement.getBoundingClientRect(); // Container rect
                    const width = 200; // Known width
                    const windowWidth = window.innerWidth;

                    // If space on right is insufficient, align right (popup goes left)
                    if (rect.left + width > windowWidth - 20) {
                        wrapper.style.left = 'auto';
                        wrapper.style.right = '0';
                    } else {
                        wrapper.style.left = '0';
                        wrapper.style.right = 'auto';
                    }
                } else {
                    wrapper.style.display = 'none';
                }
            });

            picker.addEventListener('color-changed', (e) => {
                const color = e.detail.value;
                swatch.style.backgroundColor = color;
                onColorChange(color);
            });

            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target) && !swatch.contains(e.target)) {
                    wrapper.style.display = 'none';
                }
            });
        }
    }
}
