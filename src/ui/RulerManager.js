export class RulerManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.canvas = canvasManager.canvas;

        // DOM Elements
        this.rulerH = document.getElementById('ruler-h');
        this.rulerV = document.getElementById('ruler-v');
        this.wrapper = document.getElementById('canvas-wrapper');

        // Contexts
        this.ctxH = this.rulerH ? this.rulerH.getContext('2d') : null;
        this.ctxV = this.rulerV ? this.rulerV.getContext('2d') : null;

        // Config
        this.size = 20; // height/width of ruler
        this.isActive = true;

        // State
        this.lastTransform = null;

        this.init();
    }

    init() {
        if (!this.rulerH || !this.rulerV) return;

        // Initial Resize
        this.resize();

        // Listeners
        window.addEventListener('resize', () => this.resize());

        // Fabric Events for Sync
        this.canvas.on('after:render', () => this.draw());
        this.canvas.on('mouse:wheel', () => this.draw());

        // Resize Observer for Wrapper (in case of layout changes)
        const ro = new ResizeObserver(() => this.resize());
        ro.observe(this.wrapper);

        this.setupInteractions();
    }

    setupInteractions() {
        // Horizontal Ruler Interaction
        this.rulerH.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDraggingGuide = true;
            this.activeGuide = this.cm.addGuide('horizontal', 0); // Start at 0
            this.dragAxis = 'horizontal';

            this.startDrag();
        });

        // Vertical Ruler Interaction
        this.rulerV.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDraggingGuide = true;
            this.activeGuide = this.cm.addGuide('vertical', 0);
            this.dragAxis = 'vertical';
            this.startDrag();
        });
    }

    startDrag() {
        const onMove = (e) => {
            if (!this.activeGuide) return;

            const vpt = this.canvas.viewportTransform;
            const zoom = vpt[0];
            const panX = vpt[4];
            const panY = vpt[5];

            // Screen mouse pos relative to canvas wrapper?
            // e.clientX is global.
            // rect of wrapper
            const rect = this.wrapper.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Convert to workspace
            const workspaceX = (mouseX - panX) / zoom;
            const workspaceY = (mouseY - panY) / zoom;

            if (this.dragAxis === 'horizontal') {
                this.activeGuide.set('top', workspaceY);
                this.activeGuide.set('left', 0);
            } else {
                this.activeGuide.set('left', workspaceX);
                this.activeGuide.set('top', 0);
            }

            this.activeGuide.setCoords();
            this.canvas.requestRenderAll();
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            this.isDraggingGuide = false;
            this.activeGuide = null;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }

    toggle() {
        this.isActive = !this.isActive;
        const parent = document.getElementById('ruler-wrapper');

        if (parent) {
            const hRow = parent.children[0];
            const vCol = parent.children[1].children[0];

            hRow.style.display = this.isActive ? 'flex' : 'none';
            vCol.style.display = this.isActive ? 'block' : 'none';

            // Trigger resize
            if (this.cm.viewport) {
                this.cm.viewport.resizeCanvasElement(this.wrapper.clientWidth, this.wrapper.clientHeight);
            }
        }
    }

    resize() {
        if (!this.rulerH || !this.rulerV || !this.wrapper) return;

        // Match Wrapper Dimensions
        const w = this.wrapper.clientWidth;
        const h = this.wrapper.clientHeight;

        // H Ruler: Width = Wrapper Width
        this.rulerH.width = w;
        this.rulerH.height = this.size;

        // V Ruler: Height = Wrapper Height
        this.rulerV.width = this.size;
        this.rulerV.height = h;

        this.draw();
    }

    draw() {
        if (!this.isActive) return;
        if (!this.ctxH || !this.ctxV) return;
        if (!this.canvas) return;

        const vpt = this.canvas.viewportTransform; // [zoom, 0, 0, zoom, panX, panY]
        const zoom = vpt[0];
        const panX = vpt[4];
        const panY = vpt[5];

        // Clear
        this.ctxH.clearRect(0, 0, this.rulerH.width, this.rulerH.height);
        this.ctxV.clearRect(0, 0, this.rulerV.width, this.rulerV.height);

        // Styles
        this.ctxH.fillStyle = '#1e1e1e'; // bg-secondary
        this.ctxH.fillRect(0, 0, this.rulerH.width, this.rulerH.height);
        this.ctxV.fillStyle = '#1e1e1e';
        this.ctxV.fillRect(0, 0, this.rulerV.width, this.rulerV.height);

        this.ctxH.fillStyle = '#a1a1aa'; // text-secondary
        this.ctxH.strokeStyle = '#3f3f46'; // border-color
        this.ctxH.font = '10px Inter';

        this.ctxV.fillStyle = '#a1a1aa';
        this.ctxV.strokeStyle = '#3f3f46';
        this.ctxV.font = '10px Inter';

        this.drawHRuler(zoom, panX);
        this.drawVRuler(zoom, panY);
    }

    drawHRuler(zoom, panX) {
        const ctx = this.ctxH;
        const width = this.rulerH.width;

        // Logic to determine step sizing based on zoom
        const baseStep = 50;
        let step = baseStep;

        if (zoom >= 2) step = 10;
        else if (zoom >= 1) step = 25;
        else if (zoom >= 0.5) step = 50;
        else if (zoom >= 0.25) step = 100;
        else step = 250;

        const startX = (0 - panX) / zoom;
        const endX = (width - panX) / zoom;

        // Round to nearest step
        const firstTick = Math.floor(startX / step) * step;

        ctx.beginPath();
        for (let x = firstTick; x <= endX; x += step) {
            const screenX = x * zoom + panX;

            // Skip off-screen
            if (screenX < 0 || screenX > width) continue;

            // Draw Tick
            const isMajor = x % (step * 2) === 0;
            const tickHeight = isMajor ? 12 : 6;

            ctx.moveTo(screenX + 0.5, 0);
            ctx.lineTo(screenX + 0.5, tickHeight);

            // Draw Label
            if (isMajor) {
                ctx.fillText(Math.round(x), screenX + 4, 10);
            }
        }
        ctx.stroke();
    }

    drawVRuler(zoom, panY) {
        const ctx = this.ctxV;
        const height = this.rulerV.height;

        let step = 50;
        if (zoom >= 2) step = 10;
        else if (zoom >= 1) step = 25;
        else if (zoom >= 0.5) step = 50;
        else if (zoom >= 0.25) step = 100;
        else step = 250;

        const startY = (0 - panY) / zoom;
        const endY = (height - panY) / zoom;

        const firstTick = Math.floor(startY / step) * step;

        ctx.beginPath();
        for (let y = firstTick; y <= endY; y += step) {
            const screenY = y * zoom + panY;
            if (screenY < 0 || screenY > height) continue;

            const isMajor = y % (step * 2) === 0;
            const tickWidth = isMajor ? 12 : 6;

            ctx.moveTo(0, screenY + 0.5);
            ctx.lineTo(tickWidth, screenY + 0.5);

            if (isMajor) {
                ctx.save();
                ctx.translate(2, screenY + 12);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(Math.round(y), 0, 0);
                ctx.restore();
            }
        }
        ctx.stroke();
    }
}
