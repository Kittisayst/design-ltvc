import Sortable from 'sortablejs';
import { createIcons, icons } from 'lucide';
import { ActiveSelection } from 'fabric';

export class LayersPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
        this.container = document.getElementById('layers-list');
        this.sortables = []; // Keep track to destroy
    }

    init() {
        if (!this.container) return;

        // Listen to Canvas events to refresh list
        this.cm.canvas.on('object:added', () => this.render());
        this.cm.canvas.on('object:removed', () => this.render());
        this.cm.canvas.on('object:modified', () => this.render());
        this.cm.canvas.on('selection:created', () => this.updateSelection());
        this.cm.canvas.on('selection:updated', () => this.updateSelection());
        this.cm.canvas.on('selection:cleared', () => this.updateSelection());

        this.render();
    }

    render() {
        if (!this.container) return;

        // Cleanup old sortables
        this.sortables.forEach(s => s.destroy());
        this.sortables = [];

        this.container.innerHTML = '';

        // Root Objects (Top Level)
        const rootObjects = this.cm.canvas.getObjects();
        // We pass the objects array directly. Logic inside handles reverse for UI.

        this.renderList(this.container, rootObjects, null); // null = Root is Canvas

        createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } });
        this.updateSelection();
    }

    // parentObject is null for Canvas, or a fabric.Group instance
    renderList(container, objects, parentObject) {
        // UI should show Top (Highest Z) first.
        // Fabric objects are [Bottom, ..., Top].
        // So we iterate in reverse.
        const reversed = objects.slice().reverse();

        // Identify context for Sortable
        container.dataset.isRoot = parentObject ? 'false' : 'true';
        // We can attach parent ref to DOM for retrieval in Sortable event
        container._fabricParent = parentObject;

        reversed.forEach((obj, index) => {
            // UI Index 0 = Top = Fabric objects.length - 1

            const itemWrap = document.createElement('div');
            itemWrap.className = 'layer-wrapper';

            // Layer Item Row
            const item = document.createElement('div');
            item.className = 'layer-item';
            // Indentation handled by nested DOM structure, usually we just pad-left?
            // With nested divs, padding adds up automatically if we style .layer-children.
            // But let's verify CSS. Assuming .layer-children { padding-left: 20px }

            let iconName = 'box';
            if (obj.type === 'i-text') iconName = 'type';
            else if (obj.type === 'image') iconName = 'image';
            else if (obj.type === 'rect') iconName = 'square';
            else if (obj.type === 'circle') iconName = 'circle';
            else if (obj.type === 'group') iconName = 'folder';

            const name = obj.name || `${obj.type}`;

            item.innerHTML = `
                <div class="layer-handle"><i data-lucide="grip-vertical"></i></div>
                <div class="layer-icon"><i data-lucide="${iconName}"></i></div>
                <div class="layer-name-wrap" style="flex:1; overflow:hidden;">
                    <span class="layer-name">${name}</span>
                    <input type="text" class="layer-rename-input hidden" value="${name}">
                </div>
                <div class="layer-actions">
                    <button class="icon-btn btn-xs btn-lock ${obj.lockMovementX ? 'active' : ''}" title="Lock">
                        <i data-lucide="${obj.lockMovementX ? 'lock' : 'unlock'}"></i>
                    </button>
                    <button class="icon-btn btn-xs btn-visible ${!obj.visible ? 'active' : ''}" title="Toggle Visibility">
                        <i data-lucide="${obj.visible ? 'eye' : 'eye-off'}"></i>
                    </button>
                </div>
            `;

            item._fabricObject = obj; // Store Ref
            this.setupLayerEvents(item, obj);
            itemWrap.appendChild(item);

            // Nested Children for Groups
            if (obj.type === 'group' && obj.getObjects) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'layer-children';
                childrenContainer.style.paddingLeft = '20px'; // Simple recursive indent

                // recurse
                this.renderList(childrenContainer, obj.getObjects(), obj);
                itemWrap.appendChild(childrenContainer);
            }

            container.appendChild(itemWrap);
        });

        // Init Sortable on this container
        const sortable = new Sortable(container, {
            group: 'layers', // Allow dragging between lists? Plan said restrict initially.
            // If we allow 'nested', sortable handles it. 
            // Warning: Reparenting in Fabric is complex (transforms must be recalculated).
            // Let's restrict to 'same group' first: group: { name: 'g-' + (parentObject ? parentObject.uid : 'root'), pull: false, put: false }
            // Actually, simply giving unique group names prevents cross-drag.
            group: parentObject ? `group-${parentObject.uid || Math.random()}` : 'root',
            animation: 150,
            handle: '.layer-handle',
            ghostClass: 'layer-item-ghost',
            onEnd: (evt) => {
                this.handleReorder(evt, container);
            }
        });
        this.sortables.push(sortable);
    }

    setupLayerEvents(item, obj) {
        // Selection
        item.addEventListener('click', (e) => {
            if (e.target.closest('.layer-actions') || e.target.closest('.layer-rename-input')) return;
            e.stopPropagation(); // Prevent bubbling

            const canvas = this.cm.canvas;

            // Multi-selection Logic
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                const active = canvas.getActiveObject();
                let newSelection = [];

                if (active) {
                    if (active.type === 'activeSelection' || active.type === 'activeselection') {
                        newSelection = [...active.getObjects()];
                    } else {
                        newSelection = [active];
                    }
                }

                // Check if obj is already selected
                const index = newSelection.indexOf(obj);

                if (index > -1) {
                    // Deselect if already in set (only for Ctrl, maybe?)
                    // Standard behavior: Ctrl toggles, Shift extends range.
                    // For simplicity, treating both as "Toggle/Add" for now, or just Add?
                    // Let's implement Toggle for Ctrl, and simple Add for Shift (range is hard with sortable tree).

                    if (e.ctrlKey || e.metaKey) {
                        newSelection.splice(index, 1);
                    }
                    // If Shift, we generally want to keep it selected or add range. 
                    // Let's just do toggle for Ctrl, Add for Shift.
                } else {
                    newSelection.push(obj);
                }

                if (newSelection.length === 0) {
                    canvas.discardActiveObject();
                } else if (newSelection.length === 1) {
                    canvas.setActiveObject(newSelection[0]);
                } else {
                    const sel = new fabric.ActiveSelection(newSelection, {
                        canvas: canvas
                    });
                    canvas.setActiveObject(sel);
                }
            } else {
                // Single Select
                canvas.discardActiveObject();
                canvas.setActiveObject(obj);
            }

            canvas.requestRenderAll();
        });

        // Rename
        const nameSpan = item.querySelector('.layer-name');
        const nameInput = item.querySelector('.layer-rename-input');

        item.addEventListener('dblclick', (e) => {
            if (e.target.closest('.layer-actions')) return;
            e.stopPropagation();
            nameSpan.classList.add('hidden');
            nameInput.classList.remove('hidden');
            nameInput.focus();
            nameInput.select();
        });

        const saveName = () => {
            const newName = nameInput.value.trim();
            if (newName) {
                obj.set('name', newName);
                nameSpan.textContent = newName;
                this.cm.canvas.requestRenderAll(); // no need to re-render whole list
            }
            nameSpan.classList.remove('hidden');
            nameInput.classList.add('hidden');
        };

        nameInput.addEventListener('blur', saveName);
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveName();
        });

        // Lock
        const btnLock = item.querySelector('.btn-lock');
        btnLock.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = !obj.lockMovementX;
            obj.set({ lockMovementX: val, lockMovementY: val, lockRotation: val, lockScalingX: val, lockScalingY: val });
            this.cm.canvas.requestRenderAll();
            // Update Icon Only
            const i = btnLock.querySelector('i');
            i.setAttribute('data-lucide', val ? 'lock' : 'unlock');
            createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } }, btnLock.parentElement);
            if (val) btnLock.classList.add('active'); else btnLock.classList.remove('active');
        });

        // Visible
        const btnVisible = item.querySelector('.btn-visible');
        btnVisible.addEventListener('click', (e) => {
            e.stopPropagation();
            obj.set('visible', !obj.visible);
            this.cm.canvas.requestRenderAll();
            // Update Icon Only
            const i = btnVisible.querySelector('i');
            i.setAttribute('data-lucide', obj.visible ? 'eye' : 'eye-off');
            createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } }, btnVisible.parentElement);
            if (!obj.visible) btnVisible.classList.add('active'); else btnVisible.classList.remove('active');
        });
    }

    updateSelection() {
        // Clear all selected
        const allItems = this.container.querySelectorAll('.layer-item');
        allItems.forEach(i => i.classList.remove('selected'));

        const active = this.cm.canvas.getActiveObject();
        if (active) {
            // Find matched item
            // We stored ref on item._fabricObject
            // Note: If active is ActiveSelection (multi), we might want to highlight multiple.

            const targetObjects = active.type === 'activeSelection' ? active.getObjects() : [active];

            allItems.forEach(item => {
                if (targetObjects.includes(item._fabricObject)) {
                    item.classList.add('selected');
                    // Scroll into view?
                    // item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }

    handleReorder(evt, container) {
        // evt.oldIndex, evt.newIndex
        // NOTE: Sortable counts children in DOM.
        // Our DOM is: <div wrapper>...</div> <div wrapper>...</div>
        // So indices map 1:1 to the reversed array.

        const parentObj = container._fabricParent; // Group or null (root)

        // Get the relevant objects array (Fabric Order: Bottom -> Top)
        let objects;
        if (parentObj) {
            objects = parentObj.getObjects();
        } else {
            objects = this.cm.canvas.getObjects();
        }

        const total = objects.length;

        // Map DOM Index (Top -> Bottom) to Fabric Index (Bottom -> Top)
        // DOM 0 = Fabric last
        // DOM oldIndex -> Fabric (total - 1 - oldIndex)

        const fabricOldIndex = total - 1 - evt.oldIndex;
        const fabricNewIndex = total - 1 - evt.newIndex;

        if (fabricOldIndex === fabricNewIndex) return;

        const obj = objects[fabricOldIndex];

        if (parentObj) {
            // Reordering inside a group
            // Remove and Insert? 
            // Fabric Group objects array manipulation
            parentObj.remove(obj);
            parentObj.insertAt(fabricNewIndex, obj);

            parentObj._calcBounds();
            parentObj.setCoords();
            this.cm.canvas.requestRenderAll();
        } else {
            // Root
            this.cm.canvas.moveObjectTo(obj, fabricNewIndex);
            this.cm.canvas.requestRenderAll();
        }

        // No need to full re-render UI, Sortable did it visually??
        // Wait, Sortable moved the DOM. But our recursive structure means a DOM element is (Wrapper -> (Item, Children)).
        // Yes, Sortable moves the Wrapper. So the tree structure is preserved.
        // But we should probably re-render to ensure data integrity and re-calc colors/indent if needed?
        // Actually it's cleaner to re-render to ensure no desync.
        this.render();
    }
}
