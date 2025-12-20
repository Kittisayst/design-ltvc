import { ElementsPanel } from './ElementsPanel.js';
import { PropertyPanel } from './PropertyPanel.js';
import { ExportPanel } from './ExportPanel.js';
import { LayersPanel } from './LayersPanel.js';
import { FloatingToolbar } from './FloatingToolbar.js';
import { TemplatesPanel } from './TemplatesPanel.js';
import { RulerManager } from './RulerManager.js';
import { ContextMenu } from './ContextMenu.js';

export class UIManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.dom = {};

        // Sub-modules
        this.elementsPanel = null;
        this.propertyPanel = null;
        this.exportPanel = null;
        this.layersPanel = null;
        this.floatingToolbar = null;
        this.templatesPanel = null;
        this.rulerManager = null;
        this.contextMenu = null;
    }

    init() {
        this.cacheDOM();

        // Init Sub-modules
        this.elementsPanel = new ElementsPanel(this.dom, this.cm);
        this.propertyPanel = new PropertyPanel(this.dom, this.cm);
        this.exportPanel = new ExportPanel(this.dom, this.cm);
        this.layersPanel = new LayersPanel(this.dom, this.cm);
        this.floatingToolbar = new FloatingToolbar(this.cm);
        this.templatesPanel = new TemplatesPanel(this.dom, this.cm);
        this.rulerManager = new RulerManager(this.cm);
        this.contextMenu = new ContextMenu(this.cm);

        this.elementsPanel.init();
        this.propertyPanel.init();
        this.exportPanel.init();
        this.layersPanel.init();
        this.floatingToolbar.init();
        this.templatesPanel.init();
        this.contextMenu.init();

        this.bindGlobalEvents();
        this.bindSidebarTabs();
    }

    cacheDOM() {
        // Global / Shared Inputs
        this.dom.widthInput = document.getElementById('c-width');
        this.dom.heightInput = document.getElementById('c-height');
        this.dom.bgType = document.getElementById('bg-type');
        this.dom.bgColor = document.getElementById('bg-color');
        this.dom.fileInput = document.getElementById('file-input'); // Shared by Image btn and Elements

        // Sections for Property Panel
        this.dom.posControls = document.getElementById('pos-controls');
        this.dom.alignPage = document.getElementById('align-page-controls');
        this.dom.alignElem = document.getElementById('align-elem-controls');
        this.dom.textControls = document.getElementById('text-controls');

        // Adv Props
        this.dom.propX = document.getElementById('prop-x');
        this.dom.propY = document.getElementById('prop-y');
        this.dom.propW = document.getElementById('prop-w');
        this.dom.propH = document.getElementById('prop-h');
        this.dom.propAngle = document.getElementById('prop-angle');
        this.dom.btnLock = document.getElementById('btn-lock');

        // Text Controls
        this.dom.fontFamily = document.getElementById('font-family');
        this.dom.textColor = document.getElementById('text-color');
        this.dom.textSize = document.getElementById('text-size');
        this.dom.btnBold = document.getElementById('btn-bold');
        this.dom.btnItalic = document.getElementById('btn-italic');
        this.dom.btnUnderline = document.getElementById('btn-underline');
    }

    bindGlobalEvents() {
        // Delete Key (Global)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Check if we are typing in an input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                this.cm.removeActiveObject();
            }
        });

        // Undo / Redo
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        if (btnUndo) btnUndo.addEventListener('click', () => this.cm.history.undo());
        if (btnRedo) btnRedo.addEventListener('click', () => this.cm.history.redo());

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Check active inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const isCtrl = e.ctrlKey || e.metaKey;

            // Delete / Backspace
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.cm.removeActiveObject();
                return;
            }

            // Undo (Ctrl+Z)
            if (isCtrl && !e.shiftKey && e.code === 'KeyZ') {
                e.preventDefault();
                this.cm.history.undo();
                return;
            }

            // Redo (Ctrl+Y or Ctrl+Shift+Z)
            if ((isCtrl && e.code === 'KeyY') || (isCtrl && e.shiftKey && e.code === 'KeyZ')) {
                e.preventDefault();
                this.cm.history.redo();
                return;
            }

            // Group (Ctrl+G)
            if (isCtrl && !e.shiftKey && e.code === 'KeyG') {
                e.preventDefault();
                this.cm.group();
                return;
            }

            // Ungroup (Ctrl+Shift+G)
            if (isCtrl && e.shiftKey && e.code === 'KeyG') {
                e.preventDefault();
                this.cm.ungroup();
                return;
            }
        });

        this.bindNavbarEvents();
    }

    bindSidebarTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add to clicked
                tab.classList.add('active');

                // Hide all wrappers
                document.getElementById('elements-wrapper').style.display = 'none';
                document.getElementById('templates-wrapper').style.display = 'none';

                // Show target
                const targetId = tab.dataset.target;
                const target = document.getElementById(targetId);
                if (target) target.style.display = 'block';
            });
        });
    }

    bindNavbarEvents() {
        // Zoom Controls
        const bindClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };

        bindClick('btn-zoom-in', () => this.cm.zoomIn());
        bindClick('btn-zoom-out', () => this.cm.zoomOut());
        bindClick('btn-zoom-reset', () => this.cm.resetZoom());

        // View Options
        const btnRuler = document.getElementById('btn-toggle-rulers');
        if (btnRuler) {
            btnRuler.addEventListener('click', () => {
                this.rulerManager.toggle();
                btnRuler.classList.toggle('active');
            });
        }

        const btnGrid = document.getElementById('btn-toggle-grid');
        if (btnGrid) {
            btnGrid.addEventListener('click', () => {
                const isActive = this.cm.toggleGrid();
                if (isActive) btnGrid.classList.add('active');
                else btnGrid.classList.remove('active');
            });
        }

        // Zoom Level Display
        if (this.cm.onZoomChange) {
            this.cm.onZoomChange((zoom) => {
                const percent = Math.round(zoom * 100) + '%';
                const el = document.getElementById('zoom-level');
                if (el) el.textContent = percent;
            });
        }

        // Hand Tool
        bindClick('btn-hand-tool', () => {
            const isActive = this.cm.toggleHandMode();
            const btn = document.getElementById('btn-hand-tool');
            if (btn) isActive ? btn.classList.add('active') : btn.classList.remove('active');

            // Disable Draw Mode if active
            const drawBtn = document.getElementById('btn-draw-mode');
            if (isActive && drawBtn && drawBtn.classList.contains('active')) {
                drawBtn.click(); // Toggle off
            }
        });

        // Draw Mode
        bindClick('btn-draw-mode', () => {
            const btn = document.getElementById('btn-draw-mode');
            const wasActive = btn.classList.contains('active');

            if (!wasActive) {
                // Enable
                this.cm.enableDrawingMode();
                btn.classList.add('active');

                // Disable Hand Mode if active
                const handBtn = document.getElementById('btn-hand-tool');
                if (handBtn && handBtn.classList.contains('active')) {
                    this.cm.toggleHandMode(); // Should toggle off
                    handBtn.classList.remove('active');
                }
            } else {
                // Disable
                this.cm.disableDrawingMode();
                btn.classList.remove('active');
            }

            // Force Property Panel Update
            this.propertyPanel.render();
        });

        // Resize Modal (If it was lost too, let's restore it here for safety, or check if it's elsewhere)
        // Previous PropertyPanel had it. Let's add it back here as it is global.
        const btnOpenResize = document.getElementById('btn-open-resize');
        const resizeDialog = document.getElementById('resize-dialog');
        const btnCloseResize = document.getElementById('btn-close-resize');
        const btnApplyResize = document.getElementById('btn-apply-resize');

        if (btnOpenResize && resizeDialog) {
            btnOpenResize.addEventListener('click', () => {
                if (this.dom.widthInput) document.getElementById('resize-w').value = this.cm.canvas.width;
                if (this.dom.heightInput) document.getElementById('resize-h').value = this.cm.canvas.height;
                resizeDialog.showModal();
            });

            if (btnCloseResize) btnCloseResize.addEventListener('click', () => resizeDialog.close());

            if (btnApplyResize) {
                btnApplyResize.addEventListener('click', () => {
                    const w = parseInt(document.getElementById('resize-w').value, 10);
                    const h = parseInt(document.getElementById('resize-h').value, 10);
                    if (w > 0 && h > 0) {
                        this.cm.resize(w, h);
                        resizeDialog.close();
                    }
                });
            }

            resizeDialog.addEventListener('click', (e) => {
                const rect = resizeDialog.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    resizeDialog.close();
                }
            });
        }
    }
}
