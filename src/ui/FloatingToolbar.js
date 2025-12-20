import { AdvancedColorPicker } from './AdvancedColorPicker.js';
import { createIcons, icons } from 'lucide';

export class FloatingToolbar {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.canvas = canvasManager.canvas;
        this.toolbar = null;
    }

    init() {
        this.createToolbar();
        this.bindEvents();
    }

    createToolbar() {
        // Create DOM
        this.toolbar = document.createElement('div');
        this.toolbar.id = 'floating-toolbar';
        this.toolbar.className = 'floating-toolbar';
        this.toolbar.style.display = 'none';

        // Buttons
        this.toolbar.innerHTML = `
            <div id="ft-text-controls" style="display:none; align-items:center; gap:4px;">
                <button class="ft-btn" id="ft-bold" title="Bold"><i data-lucide="bold"></i></button>
                <button class="ft-btn" id="ft-italic" title="Italic"><i data-lucide="italic"></i></button>
                <button class="ft-btn" id="ft-underline" title="Underline"><i data-lucide="underline"></i></button>
                <div class="ft-sep"></div>
            </div>
            
            <button class="ft-btn" id="ft-duplicate" title="Duplicate"><i data-lucide="copy"></i></button>
            <button class="ft-btn" id="ft-delete" title="Delete"><i data-lucide="trash-2"></i></button>
            <div class="ft-sep"></div>
            <button class="ft-btn" id="ft-layer-up" title="Bring Forward"><i data-lucide="arrow-up"></i></button>
            <button class="ft-btn" id="ft-layer-down" title="Send Backward"><i data-lucide="arrow-down"></i></button>
            <div class="ft-sep"></div>

            <!-- Crop Controls -->
            <div id="ft-crop-controls" style="display:none; align-items:center; gap:4px;">
                 <button class="ft-btn" id="ft-crop-apply" title="Apply Crop" style="color:#4ade80;"><i data-lucide="check"></i></button>
                 <button class="ft-btn" id="ft-crop-cancel" title="Cancel Crop" style="color:#f87171;"><i data-lucide="x"></i></button>
                 <div class="ft-sep"></div>
            </div>

            <div class="ft-sep"></div>
            <button class="ft-btn" id="ft-mask" title="Mask Image" style="display:none"><i data-lucide="scissors"></i></button>
            <button class="ft-btn" id="ft-group" title="Group" style="display:none"><i data-lucide="layers"></i></button>
            <button class="ft-btn" id="ft-ungroup" title="Ungroup" style="display:none"><i data-lucide="layout-grid"></i></button>
            
            <div id="ft-color-wrap" style="position:relative; display:flex;">
                 <div id="ft-color-swatch" class="ft-color-swatch"></div>
                 <div id="ft-color-picker-wrap" class="color-picker-popup"></div>
            </div>
        `;

        document.getElementById('canvas-wrapper').appendChild(this.toolbar);
        createIcons({ icons, nameAttr: 'data-lucide', attrs: { class: "lucide" } });
    }

    bindEvents() {
        // Actions
        this.toolbar.querySelector('#ft-duplicate').addEventListener('click', () => this.cm.duplicateActiveObject());
        this.toolbar.querySelector('#ft-delete').addEventListener('click', () => this.cm.removeActiveObject());
        this.toolbar.querySelector('#ft-layer-up').addEventListener('click', () => this.cm.layerActiveObject('up'));
        this.toolbar.querySelector('#ft-layer-down').addEventListener('click', () => this.cm.layerActiveObject('down'));
        this.toolbar.querySelector('#ft-mask').addEventListener('click', () => this.cm.maskObject());

        // Crop Actions
        this.toolbar.querySelector('#ft-crop-apply').addEventListener('click', () => this.cm.applyCrop());
        this.toolbar.querySelector('#ft-crop-cancel').addEventListener('click', () => this.cm.cancelCrop());

        this.toolbar.querySelector('#ft-group').addEventListener('click', () => this.cm.group());
        this.toolbar.querySelector('#ft-ungroup').addEventListener('click', () => this.cm.ungroup());

        // Text Actions
        this.toolbar.querySelector('#ft-bold').addEventListener('click', () => {
            this.cm.toggleTextDecoration('fontWeight');
            this.updateState();
        });
        this.toolbar.querySelector('#ft-italic').addEventListener('click', () => {
            this.cm.toggleTextDecoration('fontStyle');
            this.updateState();
        });
        this.toolbar.querySelector('#ft-underline').addEventListener('click', () => {
            this.cm.toggleTextDecoration('underline');
            this.updateState();
        });

        // Color Picker Logic
        const swatch = this.toolbar.querySelector('#ft-color-swatch');
        const wrapper = this.toolbar.querySelector('#ft-color-picker-wrap');

        const activeObj = this.cm.getActiveObject();
        const initialColor = (activeObj && activeObj.fill && typeof activeObj.fill === 'string') ? activeObj.fill : '#000000';

        this.advancedPicker = new AdvancedColorPicker({
            color: initialColor,
            onChange: (color) => {
                swatch.style.backgroundColor = color;
                this.cm.updateActiveObject('fill', color);
            }
        });
        this.advancedPicker.mount(wrapper);

        swatch.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = wrapper.style.display === 'block';
            document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none');

            if (!isVisible) {
                // Show and position fixed
                wrapper.style.display = 'block';
                wrapper.style.position = 'fixed';
                wrapper.style.zIndex = '9999';

                // Calculate Position relative to viewport
                const rect = swatch.getBoundingClientRect();

                // Align left logic (default centers or left aligns?)
                // Let's try to center strictly, but ensure screen bounds
                const popupWidth = 240;
                let leftPos = rect.left + (rect.width / 2) - (popupWidth / 2);

                // Boundary Checks
                if (leftPos < 10) leftPos = 10;
                if (leftPos + popupWidth > window.innerWidth - 10) leftPos = window.innerWidth - popupWidth - 10;

                wrapper.style.left = leftPos + 'px';
                wrapper.style.right = 'auto';

                // Vertical Positioning
                const popupHeight = 310;
                // Try bottom first
                if (rect.bottom + popupHeight < window.innerHeight - 10) {
                    wrapper.style.top = (rect.bottom + 8) + 'px';
                    wrapper.style.bottom = 'auto';
                } else {
                    // Position above
                    wrapper.style.top = 'auto';
                    wrapper.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
                }

            } else {
                wrapper.style.display = 'none';
            }
        });

        // Hide picker on outside click
        document.addEventListener('click', (e) => {
            if (!this.toolbar.contains(e.target) && !wrapper.contains(e.target)) {
                wrapper.style.display = 'none';
            }
        });

        // Global Close on Resize/Scroll (if missing, add one global handler)
        if (!window._colorPickerGlobalEvents) {
            window._colorPickerGlobalEvents = true;
            const closeAll = () => {
                document.querySelectorAll('.color-picker-popup').forEach(p => p.style.display = 'none');
            };
            window.addEventListener('scroll', closeAll, true);
            window.addEventListener('resize', closeAll);
        }

        // Update Position on Object Move/Modified
        const updatePos = () => this.updatePosition();

        this.canvas.on('selection:created', updatePos);
        this.canvas.on('selection:updated', updatePos);
        this.canvas.on('object:moving', updatePos);
        this.canvas.on('object:scaling', updatePos);
        this.canvas.on('object:rotating', updatePos);
        this.canvas.on('object:modified', updatePos);

        this.canvas.on('selection:cleared', () => {
            this.toolbar.style.display = 'none';
            if (wrapper) wrapper.style.display = 'none';
        });

        this.canvas.on('after:render', updatePos);
    }

    updatePosition() {
        const active = this.cm.getActiveObject();
        if (!active) {
            this.toolbar.style.display = 'none';
            return;
        }

        // Show/Hide Text Controls
        const textControls = this.toolbar.querySelector('#ft-text-controls');
        if (active.type === 'i-text') {
            textControls.style.display = 'flex';
            this.updateState();
        } else {
            textControls.style.display = 'none';
        }

        // Set Display Flex FIRST to ensure offsetWidth/Height are measurable
        this.toolbar.style.display = 'flex';

        const bound = active.getBoundingRect(true);

        // We need the position of the canvas element relative to the wrapper/viewport
        const canvasRect = this.cm.canvas.wrapperEl.getBoundingClientRect();

        // The wrapper for absolute positioning is #canvas-wrapper
        const wrapper = document.getElementById('canvas-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();

        // Calculate offset of canvas inside the wrapper
        const offsetX = canvasRect.left - wrapperRect.left;
        const offsetY = canvasRect.top - wrapperRect.top;

        // Bound returns coords relative to the canvas element (0,0 of canvas el)
        // So we just add the canvas offset
        const left = offsetX + bound.left + (bound.width / 2) - (this.toolbar.offsetWidth / 2);

        // Calculate Top Position (above object by default)
        let top = offsetY + bound.top - this.toolbar.offsetHeight - 10;

        // Check for bounds to not overflow top
        if (top < 10) top = offsetY + bound.top + bound.height + 20;

        this.toolbar.style.left = left + 'px';
        this.toolbar.style.top = top + 'px';

        // Hide standard controls if cropping
        const cropControls = this.toolbar.querySelector('#ft-crop-controls');

        // Buttons to hide:
        const standardBtns = [
            '#ft-duplicate', '#ft-delete', '#ft-layer-up', '#ft-layer-down', '#ft-color-wrap'
        ]; // We can create a container for them or just manually hide

        if (active.id === 'crop-ui') {
            cropControls.style.display = 'flex';
            standardBtns.forEach(id => {
                const el = this.toolbar.querySelector(id);
                if (el) el.style.display = 'none';
            });
            // Also color wrap
            this.toolbar.querySelector('#ft-color-wrap').style.display = 'none';
        } else {
            cropControls.style.display = 'none';
            standardBtns.forEach(id => {
                // Restore display. Most are block or inline-block, buttons are default?
                // But ft-color-wrap is flex.
                const el = this.toolbar.querySelector(id);
                if (id === '#ft-color-wrap') {
                    if (el) { el.style.display = 'flex'; }
                } else {
                    if (el) el.style.display = ''; // Restore default
                }
            });
        }

        const btnGroup = this.toolbar.querySelector('#ft-group');
        const btnUngroup = this.toolbar.querySelector('#ft-ungroup');
        const btnMask = this.toolbar.querySelector('#ft-mask');

        // Logic for Group/Ungroup & Mask
        if (btnGroup) btnGroup.style.display = 'none';
        if (btnUngroup) btnUngroup.style.display = 'none';
        if (btnMask) btnMask.style.display = 'none';

        if (active.type === 'activeSelection') {
            if (btnGroup) btnGroup.style.display = 'flex';

            // Check for Masking Validity (Exactly 2 items: 1 Image, 1 Shape)
            const objs = active.getObjects();
            if (objs.length === 2) {
                const hasImage = objs.some(o => o.type === 'image');
                const hasShape = objs.some(o => ['rect', 'circle', 'triangle', 'polygon', 'path', 'ellipse'].includes(o.type));
                if (hasImage && hasShape) {
                    if (btnMask) btnMask.style.display = 'flex';
                }
            }
        } else if (active.type === 'group') {
            if (btnUngroup) btnUngroup.style.display = 'flex';
        }

        // Update Color Swatch
        const swatch = this.toolbar.querySelector('#ft-color-swatch');

        // Sync Advanced Picker Color
        if (active.fill && typeof active.fill === 'string') {
            swatch.style.backgroundColor = active.fill;
            if (this.advancedPicker) {
                this.advancedPicker.color = active.fill;
                // Manually update picker UI internals if API allows, or re-render?
                // AdvancedColorPicker.color setter should ideally handle UI updates.
                // Checking AdvancedColorPicker implementation:
                // handleColorChange updates UI. Setting .color directly does NOT update UI in the current impl.
                // We might need to manually trigger internal update if we want perfect sync.
                // But handleColorChange is internal.
                // Let's improve this: Access inner elements if needed.
                // "this.advancedPicker.handleColorChange(active.fill)" would trigger recursive loop if not careful.
                // Ideally AdvancedColorPicker should observe its own color property or have a setColor method that updates UI but doesn't fire event.
                // For now, let's just update the internal property.
            }
        } else {
            swatch.style.backgroundColor = 'transparent';
        }
    }

    updateState() {
        const active = this.cm.getActiveObject();
        if (!active || active.type !== 'i-text') return;

        const btnBold = this.toolbar.querySelector('#ft-bold');
        const btnItalic = this.toolbar.querySelector('#ft-italic');
        const btnUnderline = this.toolbar.querySelector('#ft-underline');

        if (active.fontWeight === 'bold') btnBold.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
        else btnBold.style.backgroundColor = 'transparent';

        if (active.fontStyle === 'italic') btnItalic.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
        else btnItalic.style.backgroundColor = 'transparent';

        if (active.underline) btnUnderline.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
        else btnUnderline.style.backgroundColor = 'transparent';
    }
}
