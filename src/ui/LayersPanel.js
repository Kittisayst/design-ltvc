import Sortable from 'sortablejs';
import { createIcons, icons } from 'lucide';

export class LayersPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
        this.container = document.getElementById('layers-list');
    }

    init() {
        if (!this.container) return;

        // Init Sortable
        this.sortable = new Sortable(this.container, {
            animation: 150,
            handle: '.layer-handle',
            ghostClass: 'layer-item-ghost',
            onEnd: (evt) => {
                this.handleReorder(evt.oldIndex, evt.newIndex);
            }
        });

        // Listen to Canvas events to refresh list
        // We need a way to know when objects are added/removed/modified
        this.cm.canvas.on('object:added', () => this.render());
        this.cm.canvas.on('object:removed', () => this.render());
        this.cm.canvas.on('object:modified', () => this.render()); // e.g. name change?
        this.cm.canvas.on('selection:created', () => this.updateSelection());
        this.cm.canvas.on('selection:updated', () => this.updateSelection());
        this.cm.canvas.on('selection:cleared', () => this.updateSelection());

        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        // Fabric stores objects in bottom-up order (0 is background).
        // UI Layers usually show top-down (0 is top).
        // So we reverse the array for display.
        const objects = this.cm.canvas.getObjects().slice().reverse();

        objects.forEach((obj, index) => {
            // Calculate actual index in fabric (reversed)
            const fabricIndex = objects.length - 1 - index;

            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.index = fabricIndex;

            // Icon based on type
            let iconName = 'box';
            if (obj.type === 'i-text') iconName = 'type';
            else if (obj.type === 'image') iconName = 'image';
            else if (obj.type === 'rect') iconName = 'square';
            else if (obj.type === 'circle') iconName = 'circle';
            else if (obj.type === 'triangle') iconName = 'triangle';
            else if (obj.type === 'group') iconName = 'layers';

            // Name (default or custom)
            const name = obj.name || `${obj.type} ${fabricIndex + 1}`;

            item.innerHTML = `
                <div class="layer-handle"><i data-lucide="grip-vertical"></i></div>
                <div class="layer-icon"><i data-lucide="${iconName}"></i></div>
                <div class="layer-name">${name}</div>
                <div class="layer-actions">
                    <button class="icon-btn btn-xs btn-lock ${obj.lockMovementX ? 'active' : ''}" title="Lock">
                        <i data-lucide="${obj.lockMovementX ? 'lock' : 'unlock'}"></i>
                    </button>
                    <button class="icon-btn btn-xs btn-visible ${!obj.visible ? 'active' : ''}" title="Toggle Visibility">
                        <i data-lucide="${obj.visible ? 'eye' : 'eye-off'}"></i>
                    </button>
                </div>
            `;

            // Events
            item.addEventListener('click', (e) => {
                // Ignore clicks on actions
                if (e.target.closest('.layer-actions')) return;

                this.cm.canvas.discardActiveObject();
                this.cm.canvas.setActiveObject(obj);
                this.cm.canvas.requestRenderAll();
            });

            // Action: Lock
            const btnLock = item.querySelector('.btn-lock');
            btnLock.addEventListener('click', (e) => {
                e.stopPropagation();
                const isLocked = !obj.lockMovementX;
                obj.set({
                    lockMovementX: isLocked,
                    lockMovementY: isLocked,
                    lockRotation: isLocked,
                    lockScalingX: isLocked,
                    lockScalingY: isLocked
                });
                this.render(); // Re-render to update icon
            });

            // Action: Visible
            const btnVisible = item.querySelector('.btn-visible');
            btnVisible.addEventListener('click', (e) => {
                e.stopPropagation();
                obj.set('visible', !obj.visible);
                this.cm.canvas.requestRenderAll();
                this.render();
            });


            this.container.appendChild(item);
        });

        createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } });
        this.updateSelection();
    }

    updateSelection() {
        const active = this.cm.canvas.getActiveObject();
        const items = this.container.querySelectorAll('.layer-item');
        items.forEach(item => item.classList.remove('selected'));

        if (active) {
            // If group selection, maybe select multiple? For simplicity, just highlight if single.
            // If active is array (multi), we could highlight all.
            // But Fabric activeObject is one object (Group or Single).

            // Note: Fabric logic for getObjects() and activeObject matching
            const objects = this.cm.canvas.getObjects(); // bottom-up

            if (active.type === 'activeSelection') {
                active.getObjects().forEach(obj => {
                    const idx = objects.indexOf(obj);
                    const item = this.container.querySelector(`.layer-item[data-index="${idx}"]`);
                    if (item) item.classList.add('selected');
                });
            } else {
                const idx = objects.indexOf(active);
                const item = this.container.querySelector(`.layer-item[data-index="${idx}"]`);
                if (item) item.classList.add('selected');
            }
        }
    }

    handleReorder(oldIndex, newIndex) {
        // List is Top-Down (Reversed). Fabric is Bottom-Up.
        // oldIndex 0 (Top) -> Fabric Last
        // newIndex 1 -> Fabric Last - 1

        const objects = this.cm.canvas.getObjects();
        const total = objects.length;

        // Convert list indices to fabric indices
        const fabricOldIndex = total - 1 - oldIndex;
        const fabricNewIndex = total - 1 - newIndex;

        const obj = objects[fabricOldIndex];

        // Move in fabric
        this.cm.canvas.moveObjectTo(obj, fabricNewIndex);

        // Refresh canvas
        this.cm.canvas.requestRenderAll();

        // Re-render list to ensure data-indices are correct
        this.render();
    }
}
