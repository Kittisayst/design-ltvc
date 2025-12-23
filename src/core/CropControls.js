import { Control, Point, util } from 'fabric';

/* 
 * Crop Logic: 
 * Modifies 'cropX', 'cropY', 'width', 'height' of the fabric.Image object.
 * Does NOT change scaleX/scaleY. 
 * 'width'/'height' are the viewport dimensions (unscaled).
 * 'cropX'/'cropY' are offsets into the source image.
 */

// Helper: Constraint Crop
function constrainCrop(target, cropX, cropY, width, height) {
    const naturalWidth = target.getOriginalSize().width; // Fabric v6
    const naturalHeight = target.getOriginalSize().height;

    // Constrain X/W
    if (cropX < 0) { width += cropX; cropX = 0; }
    if (cropX + width > naturalWidth) { width = naturalWidth - cropX; }

    // Constrain Y/H
    if (cropY < 0) { height += cropY; cropY = 0; }
    if (cropY + height > naturalHeight) { height = naturalHeight - cropY; }

    return { cropX, cropY, width, height };
}

// Handler: Right
function changeCropWidthRight(eventData, transform, x, y) {
    const target = transform.target;
    // Current Local Point relative to center
    const pointer = new Point(x, y);
    const localPoint = util.transformPoint(
        pointer,
        util.invertTransform(target.calcTransformMatrix())
    );

    // Right Edge in Local Space is ideally at x = width/2
    // We want the new Right Edge to be at localPoint.x
    // So new halfWidth = localPoint.x
    // newWidth = localPoint.x * 2? 
    // No, if we only move Right, Left stays fixed relative to the Canvas, but shifts relative to Center.

    // Actually, Fabric's 'resizing' logic is complex because changing width shifts center.
    // 
    // Strategy:
    // 1. Calculate new dimensions based on mouse delta.
    // 2. Adjust 'cropX' and 'width'.
    // 3. Adjust object 'left'/'top' to keep the "static" edge fixed on canvas.

    // Let's use simple logic:
    // Mouse X in local space (unscaled pixels) relative to CENTER.
    // currentWidth = target.width;
    // currentRight = currentWidth / 2;
    // delta = localPoint.x - currentRight;

    // If delta > 0, we open crop (width increases).
    // If delta < 0, we close crop (width decreases).

    // New Width candidate
    // const deltaScaled = delta; // Local space already
    // const newWidth = target.width + delta; 

    // BUT: Does cropX change? 
    // If we drag Right Handle, cropX (Left start) stays same.
    // Width changes.
    // Visually, the Left Edge of the image on Canvas stays put.
    // Since Fabric keeps Center fixed when width changes, Left Edge moves Left!
    // We must compensate.

    // Step 1: Calculate new Width
    // We treat localPoint.x as the new "Half Width" distance from center? 
    // No, that implies symmetric resize.
    // We want asymmetric resize (Left fixed).

    // Initial State reference?
    // transform.original has initial props.

    const w = target.width;
    const oldRightLocal = w / 2;
    const dx = localPoint.x - oldRightLocal; // Change in width

    // Apply
    let newWidth = w + dx;
    // Min Width constraint
    if (newWidth < 10) newWidth = 10;

    // Max Width constraint: cropX + newWidth <= naturalWidth
    const natW = target.getOriginalSize().width;
    const cX = target.cropX || 0;
    if (cX + newWidth > natW) {
        newWidth = natW - cX;
    }

    if (newWidth === w) return false; // No change

    // Center Shift Compensation
    // If width increases, Center moves Right by dx/2
    // Real Left = Center - Width/2.
    // New Left = (Center + Shift) - (Width+dx)/2
    //          = Center + dx/2 - Width/2 - dx/2 = Center - Width/2 (Unchanged!)
    // Wait, Fabric draws from Center.
    // If I Set width = w + dx.
    // Fabric keeps target.left unchanged (Center position).
    // So Visual Left edge = Left - (w+dx)/2*scale.
    // It moves left!
    // We want Visual Left Edge fixed.
    // So New Center must be Old Center + (dx/2 * scaleX_vector).

    // Math:
    // Shift in local x = dx / 2.
    // Rotate this vector to global.
    const cos = util.cos(target.angle);
    const sin = util.sin(target.angle);

    const shiftX = (dx / 2) * target.scaleX * cos;
    const shiftY = (dx / 2) * target.scaleX * sin;

    target.set('width', newWidth);
    target.set('left', target.left + shiftX);
    target.set('top', target.top + shiftY);

    return true;
}

// Handler: Left
function changeCropWidthLeft(eventData, transform, x, y) {
    const target = transform.target;
    const pointer = new Point(x, y);
    const localPoint = util.transformPoint(
        pointer,
        util.invertTransform(target.calcTransformMatrix())
    );

    // Left Edge in Local is -width/2.
    // Mouse is at localPoint.x.
    // Delta = localPoint.x - (-width/2) = localPoint.x + width/2.
    // If localPoint.x is -60, and width/2 is 50 (Edge at -50). Delta = -10.
    // We moved Left (Widening).
    // Change in width = -Delta (Move left = increase width).

    const w = target.width;
    const oldLeftLocal = -w / 2;
    const dx = localPoint.x - oldLeftLocal; // If positive (move right), width shrinks.

    // newWidth = w - dx.
    let newWidth = w - dx;
    if (newWidth < 10) newWidth = 10;

    // Max Constraint: cropX must reduce if we widen left.
    // cropX_new = cropX + dx.
    // If dx is negative (widening left), cropX reduces.
    // cropX >= 0.
    let cX = target.cropX || 0;
    let newCropX = cX + dx;

    if (newCropX < 0) {
        // Hit left boundary 0
        // Adjust newWidth to whatever fits
        // diff = 0 - newCropX (amount we overshot)
        // dx needs adjustment
        // newCropX = 0 => dx = -cX.
        // newWidth = w - (-cX) = w + cX. (Max possible width to left)
        newCropX = 0;
        newWidth = w + cX;
        // Recalculate dx effectively used
        // dx_eff = -cX.
    } else if (newCropX + newWidth > target.getOriginalSize().width) {
        // Should not happen if only Left moves, as Right edge is fixed?
        // Right Edge = cropX + width.
        // New Right Edge = (cropX + dx) + (w - dx) = cropX + w.
        // So Right edge remains constant in image space. Safe.
    }

    if (newWidth === w && newCropX === cX) return false;

    // Calc effective dx
    const effectiveDx = newCropX - cX;

    // Center Compensation
    // We moved Left Edge by effectiveDx.
    // Width changed by -effectiveDx.
    // Center needs to shift to keep Right Edge fixed.
    // Shift = effectiveDx / 2 * scale.

    const cos = util.cos(target.angle);
    const sin = util.sin(target.angle);

    const shiftX = (effectiveDx / 2) * target.scaleX * cos;
    const shiftY = (effectiveDx / 2) * target.scaleX * sin;

    target.set('cropX', newCropX);
    target.set('width', newWidth);
    target.set('left', target.left + shiftX);
    target.set('top', target.top + shiftY);

    return true;
}

// Similar logic for Top (cropY) and Bottom (height)
function changeCropHeightBottom(eventData, transform, x, y) {
    const target = transform.target;
    const pointer = new Point(x, y);
    const localPoint = util.transformPoint(
        pointer,
        util.invertTransform(target.calcTransformMatrix())
    );
    const h = target.height;
    const dx = localPoint.y - (h / 2); // 'dy' actually

    let newHeight = h + dx;
    if (newHeight < 10) newHeight = 10;

    const natH = target.getOriginalSize().height;
    const cY = target.cropY || 0;
    if (cY + newHeight > natH) newHeight = natH - cY;

    if (newHeight === h) return false;

    // Shift Center
    // Bottom moves, Top Fixed.
    // Shift = dx / 2.
    const cos = util.cos(target.angle);
    const sin = util.sin(target.angle);

    // Y-axis rotation logic
    // A step in local Y (down) -> Global X = -sin(angle), Global Y = cos(angle)
    // Wait, Fabric coords:
    // Local Y aligned with height.
    // Default 0 angle: Y matches global Y.
    // 90 deg: Y matches -X.

    // Correct Vector for Local Y axis is (-sin, cos).
    // shiftVector = (dx/2 * scaleY) * (-sin, cos).

    const shiftX = (dx / 2) * target.scaleY * (-sin);
    const shiftY = (dx / 2) * target.scaleY * (cos);

    target.set('height', newHeight);
    target.set('left', target.left + shiftX);
    target.set('top', target.top + shiftY);

    return true;
}

function changeCropHeightTop(eventData, transform, x, y) {
    const target = transform.target;
    const pointer = new Point(x, y);
    const localPoint = util.transformPoint(
        pointer,
        util.invertTransform(target.calcTransformMatrix())
    );

    const h = target.height;
    const dx = localPoint.y - (-h / 2); // 'dy'

    let newHeight = h - dx;
    if (newHeight < 10) newHeight = 10;

    let cY = target.cropY || 0;
    let newCropY = cY + dx;

    if (newCropY < 0) {
        newCropY = 0;
        newHeight = h + cY;
    }

    const effectiveDx = newCropY - cY;

    const cos = util.cos(target.angle);
    const sin = util.sin(target.angle);

    // Shift = effectiveDx / 2 * scaleY
    // Vector for Local Y: (-sin, cos)
    const shiftX = (effectiveDx / 2) * target.scaleY * (-sin);
    const shiftY = (effectiveDx / 2) * target.scaleY * (cos);

    target.set('cropY', newCropY);
    target.set('height', newHeight);
    target.set('left', target.left + shiftX);
    target.set('top', target.top + shiftY);

    return true;
}

// Render Control (Professional Crop Brackets)
function renderCropIcon(ctx, left, top, styleOverride, fabricObject) {
    const size = 24;
    ctx.save();
    ctx.translate(left, top);
    if (fabricObject.angle) ctx.rotate(-util.degreesToRadians(fabricObject.angle));

    // Determine type: Corner or Side?
    // How to know? We check the control map or infer from placement.
    // Fabric call: render(ctx, left, top, styleOverride, object).
    // The 'this' context in render might be the control instance? No, it's a standalone function.
    // However, we can trick it. 
    // Actually, simple heuristic: corners are diagonal cursors. Sides are straight.

    // BUT we don't have access to the control definition here easily.
    // Let's assume standard positions.
    // For Corner handles (L-brackets), we draw two lines.
    // For Side handles (Bars), we draw one thick line.

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black'; // Outline for visibility
    ctx.lineWidth = 1;

    // Default Shape: Filled Square with Border (Simple & Effective)
    // Or prefer the L-brackets? L-brackets require rotation knowledge (TL, TR, etc.)
    // Since we don't know WHICH control this is (TL vs BR), drawing direction-agnostic shapes is safer.

    // Pro style: White rectangle with black border.
    // Side handles: Broad rectangles.
    // Corner handles: Squares.

    // We can infer somewhat from scale/skew, but let's stick to a robust visual:
    // A clean white "Handle" pill/circle/square.

    // Let's do:
    // Corner: Square (8x8)
    // Side:   Long Pill (16x6)?

    // Actually, Fabric calls this for *every* control we attached it to.

    // Let's just draw a nice clean Square for all. It's standard for crop handles.
    // (Photoshop uses "Corners" for corners and "Bars" for sides, but without knowing identity it's hard).

    // Drawing a "Crop Angle" (L-shape) is hard without orientation.
    // Let's stick to a high-contrast Square.

    const w = 10;

    ctx.beginPath();
    ctx.rect(-w / 2, -w / 2, w, w);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// Create Control Set
export function getCropControls() {
    // We use standard cursors
    return {
        mr: new Control({ x: 0.5, y: 0, cursorStyle: 'ew-resize', actionHandler: changeCropWidthRight, render: renderCropIcon }),
        ml: new Control({ x: -0.5, y: 0, cursorStyle: 'ew-resize', actionHandler: changeCropWidthLeft, render: renderCropIcon }),
        mb: new Control({ x: 0, y: 0.5, cursorStyle: 'ns-resize', actionHandler: changeCropHeightBottom, render: renderCropIcon }),
        mt: new Control({ x: 0, y: -0.5, cursorStyle: 'ns-resize', actionHandler: changeCropHeightTop, render: renderCropIcon }),

        // Corners - Simplified: Just pass through to both X and Y handlers?
        // Or create new handlers calling both.
        // For simplicity, let's just use Sides for now.
        // User asked for "points to drag". Corners are important.
        // Corner logic mixes Width and Height changes.

        br: new Control({
            x: 0.5, y: 0.5, cursorStyle: 'nwse-resize',
            actionHandler: (e, t, x, y) => {
                const r1 = changeCropWidthRight(e, t, x, y);
                const r2 = changeCropHeightBottom(e, t, x, y);
                return r1 || r2;
            }, render: renderCropIcon
        }),
        bl: new Control({
            x: -0.5, y: 0.5, cursorStyle: 'nesw-resize',
            actionHandler: (e, t, x, y) => {
                const r1 = changeCropWidthLeft(e, t, x, y);
                const r2 = changeCropHeightBottom(e, t, x, y);
                return r1 || r2;
            }, render: renderCropIcon
        }),
        tr: new Control({
            x: 0.5, y: -0.5, cursorStyle: 'nesw-resize',
            actionHandler: (e, t, x, y) => {
                const r1 = changeCropWidthRight(e, t, x, y);
                const r2 = changeCropHeightTop(e, t, x, y);
                return r1 || r2;
            }, render: renderCropIcon
        }),
        tl: new Control({
            x: -0.5, y: -0.5, cursorStyle: 'nwse-resize',
            actionHandler: (e, t, x, y) => {
                const r1 = changeCropWidthLeft(e, t, x, y);
                const r2 = changeCropHeightTop(e, t, x, y);
                return r1 || r2;
            }, render: renderCropIcon
        }),
    };
}
