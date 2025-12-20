
import { createIcons, icons } from 'lucide';

export class ContextMenu {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.menu = null;
        this.activeTarget = null;
    }

    init() {
        // Create DOM
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.style.display = 'none';
        this.menu.style.position = 'fixed';
        this.menu.style.zIndex = '10000';
        this.menu.style.background = '#2a2b2e';
        this.menu.style.border = '1px solid #3f4045';
        this.menu.style.borderRadius = '6px';
        this.menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        this.menu.style.padding = '4px 0';
        this.menu.style.minWidth = '180px';

        document.body.appendChild(this.menu);

        // Global Click to close
        document.addEventListener('click', () => this.hide());
        document.addEventListener('contextmenu', (e) => {
            // Check if clicking on canvas wrapper
            if (e.target.closest('.canvas-container')) {
                e.preventDefault();
                this.show(e);
            }
        });

        // Prevent menu click closing
        this.menu.addEventListener('click', (e) => e.stopPropagation());
    }

    show(e) {
        // Determine context
        // Check what is under mouse? Fabric handles this via 'findTarget' or we use active object
        // NOTE: Context menu usually applies to Selection.

        // Update: We should select object under cursor if not selected?
        // Simulating:
        // const pointer = this.cm.canvas.getPointer(e);
        // But native event is relative to page.

        const active = this.cm.getActiveObject();
        this.activeTarget = active;
        console.log('ContextMenu: Active Object', active, 'Type:', active ? active.type : 'None');

        // Content Config
        const items = this.getMenuItems(active);

        if (items.length === 0) return;

        this.renderItems(items);

        this.menu.style.display = 'block';

        // Position
        const { clientX, clientY } = e;

        // Boundary check
        const rect = this.menu.getBoundingClientRect();
        let left = clientX;
        let top = clientY;

        if (left + rect.width > window.innerWidth) left -= rect.width;
        if (top + rect.height > window.innerHeight) top -= rect.height;

        this.menu.style.left = `${left}px`;
        this.menu.style.top = `${top}px`;
    }

    hide() {
        if (this.menu) this.menu.style.display = 'none';
    }

    getMenuItems(active) {
        const items = [];
        const hasSelection = !!active;
        const isGroup = active && (active.type === 'activeSelection' || active.type === 'activeselection' || active.type === 'group');

        // Copy/Paste (Always available via clipboard state if we track it? For now assume always show paste)
        items.push({ label: 'Copy', icon: 'copy', action: () => this.cm.duplicateActiveObject(), disabled: !hasSelection });
        if (this.cm.clipboard) {
            items.push({ label: 'Paste', icon: 'clipboard', action: () => this.cm.paste() });
        } else {
            items.push({ label: 'Paste', icon: 'clipboard', action: () => this.cm.paste(), disabled: true }); // Or hidden
        }

        items.push({ separator: true });

        // Layering
        items.push({ label: 'Bring Forward', icon: 'arrow-up', action: () => this.cm.layerActiveObject('up'), disabled: !hasSelection });
        items.push({ label: 'Send Backward', icon: 'arrow-down', action: () => this.cm.layerActiveObject('down'), disabled: !hasSelection });

        items.push({ separator: true });

        // Grouping
        if (isGroup) {
            if (active.type === 'activeSelection' || active.type === 'activeselection') {
                items.push({ label: 'Group', icon: 'folder-plus', action: () => this.cm.group() });
            } else {
                items.push({ label: 'Ungroup', icon: 'folder-minus', action: () => this.cm.ungroup() });
            }
        }

        // Lock
        if (hasSelection) {
            const isLocked = active.lockMovementX;
            items.push({
                label: isLocked ? 'Unlock' : 'Lock',
                icon: isLocked ? 'unlock' : 'lock',
                action: () => this.cm.toggleLockActiveObject()
            });
        }

        items.push({ separator: true });

        // Delete
        items.push({ label: 'Delete', icon: 'trash-2', action: () => this.cm.removeActiveObject(), disabled: !hasSelection, danger: true });

        return items;
    }

    renderItems(items) {
        this.menu.innerHTML = '';

        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.style.height = '1px';
                sep.style.background = '#3f4045';
                sep.style.margin = '4px 0';
                this.menu.appendChild(sep);
                return;
            }

            const el = document.createElement('div');
            el.className = 'context-item';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.padding = '8px 12px';
            el.style.cursor = item.disabled ? 'default' : 'pointer';
            el.style.color = item.disabled ? '#555' : '#eee';
            el.style.fontSize = '0.9rem';
            el.style.gap = '8px';

            if (item.danger) el.style.color = '#ff6b6b';

            if (!item.disabled) {
                el.addEventListener('mouseenter', () => el.style.background = '#3f4045');
                el.addEventListener('mouseleave', () => el.style.background = 'transparent');
                el.addEventListener('click', () => {
                    item.action();
                    this.hide();
                });
            }

            el.innerHTML = `
                <i data-lucide="${item.icon}" style="width:16px; height:16px"></i>
                <span>${item.label}</span>
            `;

            this.menu.appendChild(el);
        });

        createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 16, height: 16 } }, this.menu);
    }
}
