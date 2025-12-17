
import { ElementsPanel } from './ElementsPanel.js';
import { PropertyPanel } from './PropertyPanel.js';
import { ExportPanel } from './ExportPanel.js';
import { LayersPanel } from './LayersPanel.js';

export class UIManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.dom = {};

        // Sub-modules
        this.elementsPanel = null;
        this.propertyPanel = null;
        this.exportPanel = null;
        this.layersPanel = null;
    }

    init() {
        this.cacheDOM();

        // Init Sub-modules
        this.elementsPanel = new ElementsPanel(this.dom, this.cm);
        this.propertyPanel = new PropertyPanel(this.dom, this.cm);
        this.exportPanel = new ExportPanel(this.dom, this.cm);
        this.layersPanel = new LayersPanel(this.dom, this.cm);

        this.elementsPanel.init();
        this.propertyPanel.init();
        this.exportPanel.init();
        this.layersPanel.init();

        this.bindGlobalEvents();

        // Subscribe to canvas updates
        this.cm.onSelectionChange((activeObj) => {
            this.propertyPanel.updateControls(activeObj);
        });
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

        // Keyboard Shortcuts (Undo/Redo)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ')) {
                e.preventDefault();
                this.cm.history.undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY')) {
                e.preventDefault();
                this.cm.history.redo();
            }
        });
    }
}
