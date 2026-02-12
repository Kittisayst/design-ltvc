import { Path, Circle, Line, Point } from 'fabric';

/**
 * Pen Tool Manager — click to add anchor points, drag for bezier curves, double-click to finish.
 */
export class PenToolManager {
    constructor(canvasManager) {
        this.cm = canvasManager;
        this.active = false;
        this.points = [];       // [{x, y, cp1x, cp1y, cp2x, cp2y}]
        this.previewObjects = [];
        this.isDragging = false;
        this.currentDragPoint = null;

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onDblClick = this._onDblClick.bind(this);
    }

    get canvas() { return this.cm.canvas; }

    enable(options = {}) {
        if (this.active) return;
        this.active = true;
        this.points = [];
        this.strokeColor = options.strokeColor || '#000000';
        this.strokeWidth = options.strokeWidth || 2;
        this.fillColor = options.fillColor || 'transparent';
        this.closePath = options.closePath || false;

        this.canvas.discardActiveObject();
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';
        this.canvas.hoverCursor = 'crosshair';

        this.canvas.on('mouse:down', this._onMouseDown);
        this.canvas.on('mouse:move', this._onMouseMove);
        this.canvas.on('mouse:up', this._onMouseUp);
        this.canvas.on('mouse:dblclick', this._onDblClick);
    }

    disable() {
        if (!this.active) return;
        this.active = false;
        this._clearPreview();
        this.points = [];

        this.canvas.off('mouse:down', this._onMouseDown);
        this.canvas.off('mouse:move', this._onMouseMove);
        this.canvas.off('mouse:up', this._onMouseUp);
        this.canvas.off('mouse:dblclick', this._onDblClick);

        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';
        this.canvas.hoverCursor = 'move';
    }

    _getPointer(e) {
        return this.canvas.getScenePoint(e.e);
    }

    _onMouseDown(e) {
        if (!this.active) return;
        const pointer = this._getPointer(e);

        this.isDragging = true;
        this.currentDragPoint = { x: pointer.x, y: pointer.y, cp1x: pointer.x, cp1y: pointer.y, cp2x: pointer.x, cp2y: pointer.y };
        this.points.push(this.currentDragPoint);

        this._updatePreview();
    }

    _onMouseMove(e) {
        if (!this.active) return;
        const pointer = this._getPointer(e);

        if (this.isDragging && this.currentDragPoint) {
            // Dragging creates bezier control points (mirrored)
            const dx = pointer.x - this.currentDragPoint.x;
            const dy = pointer.y - this.currentDragPoint.y;
            this.currentDragPoint.cp2x = this.currentDragPoint.x + dx;
            this.currentDragPoint.cp2y = this.currentDragPoint.y + dy;
            this.currentDragPoint.cp1x = this.currentDragPoint.x - dx;
            this.currentDragPoint.cp1y = this.currentDragPoint.y - dy;
            this._updatePreview();
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.currentDragPoint = null;
    }

    _onDblClick() {
        this._finishPath();
    }

    _finishPath() {
        if (this.points.length < 2) {
            this.disable();
            return;
        }

        const pathData = this._buildPathData();
        const path = new Path(pathData, {
            fill: this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            selectable: true,
            evented: true,
            objectCaching: true
        });

        this._clearPreview();
        this.canvas.add(path);
        this.canvas.setActiveObject(path);
        this.canvas.requestRenderAll();

        this.disable();

        // Save history
        if (this.cm.historyManager) {
            this.cm.historyManager.saveState('Pen Path');
        }
    }

    _buildPathData() {
        const pts = this.points;
        if (pts.length === 0) return '';

        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            // Cubic bezier: C cp1x,cp1y cp2x,cp2y x,y
            // prev's outgoing control point is cp2, curr's incoming is cp1
            d += ` C ${prev.cp2x} ${prev.cp2y} ${curr.cp1x} ${curr.cp1y} ${curr.x} ${curr.y}`;
        }

        if (this.closePath && pts.length > 2) {
            const last = pts[pts.length - 1];
            const first = pts[0];
            d += ` C ${last.cp2x} ${last.cp2y} ${first.cp1x} ${first.cp1y} ${first.x} ${first.y} Z`;
        }

        return d;
    }

    _clearPreview() {
        this.previewObjects.forEach(obj => this.canvas.remove(obj));
        this.previewObjects = [];
        this.canvas.requestRenderAll();
    }

    _updatePreview() {
        this._clearPreview();
        const pts = this.points;

        // Draw anchor dots
        pts.forEach((p, i) => {
            const dot = new Circle({
                left: p.x - 4,
                top: p.y - 4,
                radius: 4,
                fill: i === pts.length - 1 ? '#6366f1' : '#ffffff',
                stroke: '#6366f1',
                strokeWidth: 1.5,
                selectable: false,
                evented: false,
                excludeFromExport: true,
                _isPenPreview: true
            });
            this.previewObjects.push(dot);
            this.canvas.add(dot);
        });

        // Draw control point handles for current dragging point
        if (this.isDragging && this.currentDragPoint) {
            const cp = this.currentDragPoint;
            // Handle lines
            const line1 = new Line([cp.x, cp.y, cp.cp1x, cp.cp1y], {
                stroke: '#a855f7', strokeWidth: 1, strokeDashArray: [4, 4],
                selectable: false, evented: false, excludeFromExport: true, _isPenPreview: true
            });
            const line2 = new Line([cp.x, cp.y, cp.cp2x, cp.cp2y], {
                stroke: '#a855f7', strokeWidth: 1, strokeDashArray: [4, 4],
                selectable: false, evented: false, excludeFromExport: true, _isPenPreview: true
            });
            // Handle dots
            const dot1 = new Circle({
                left: cp.cp1x - 3, top: cp.cp1y - 3, radius: 3,
                fill: '#a855f7', selectable: false, evented: false, excludeFromExport: true, _isPenPreview: true
            });
            const dot2 = new Circle({
                left: cp.cp2x - 3, top: cp.cp2y - 3, radius: 3,
                fill: '#a855f7', selectable: false, evented: false, excludeFromExport: true, _isPenPreview: true
            });
            this.previewObjects.push(line1, line2, dot1, dot2);
            this.canvas.add(line1, line2, dot1, dot2);
        }

        // Draw preview path
        if (pts.length >= 2) {
            const pathData = this._buildPathData();
            const previewPath = new Path(pathData, {
                fill: 'transparent',
                stroke: this.strokeColor,
                strokeWidth: this.strokeWidth,
                strokeDashArray: [6, 4],
                selectable: false,
                evented: false,
                excludeFromExport: true,
                _isPenPreview: true,
                opacity: 0.6
            });
            this.previewObjects.push(previewPath);
            this.canvas.add(previewPath);
        }

        this.canvas.requestRenderAll();
    }
}
