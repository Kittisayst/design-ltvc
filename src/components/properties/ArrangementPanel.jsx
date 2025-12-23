import React from 'react';
import {
    AlignLeft, AlignCenterHorizontal, AlignRight, AlignHorizontalDistributeCenter,
    ArrowUpToLine, AlignVerticalJustifyCenter, ArrowDownToLine, AlignVerticalDistributeCenter,
    ArrowLeftRight, ArrowUpDown, ArrowUp, ArrowDown,
    FolderPlus, FolderMinus
} from 'lucide-react';

export function ArrangementPanel({ activeObject, canvasManager }) {
    if (!activeObject) return null;

    const align = (type) => canvasManager.alignObjects(type, false);
    const distribute = (dir) => {
        canvasManager.distributeObjects(dir);
    };
    const layer = (dir) => canvasManager.layerActiveObject(dir);
    const flip = (dir) => canvasManager.flipActiveObject(dir);

    const type = activeObject.type ? activeObject.type.toLowerCase() : '';
    const isGroup = type === 'activeselection' || type === 'group';

    return (
        <div className="section">
            {/* Alignment */}
            <div className="section-header" style={{ marginBottom: '8px' }}>
                <div className="section-title">Align & Distribute</div>
            </div>

            <div className="inputs-grid-4 mb-2">
                {/* Horizontal */}
                <button className="icon-btn btn-xs" onClick={() => align('left')} title="Left"><AlignLeft size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => align('center')} title="Center"><AlignCenterHorizontal size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => align('right')} title="Right"><AlignRight size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => distribute('horizontal')} title="Distribute Horizontal"><AlignHorizontalDistributeCenter size={14} /></button>
            </div>
            <div className="inputs-grid-4 mb-2">
                {/* Vertical */}
                <button className="icon-btn btn-xs" onClick={() => align('top')} title="Top"><ArrowUpToLine size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => align('middle')} title="Middle"><AlignVerticalJustifyCenter size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => align('bottom')} title="Bottom"><ArrowDownToLine size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => distribute('vertical')} title="Distribute Vertical"><AlignVerticalDistributeCenter size={14} /></button>
            </div>

            {/* Ordering & Grouping */}
            <div className="section-title mt-3">Order & Group</div>
            <div className="inputs-grid-4 mb-2">
                <button className="icon-btn btn-xs" onClick={() => flip('horizontal')} title="Flip Horizontal"><ArrowLeftRight size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => flip('vertical')} title="Flip Vertical"><ArrowUpDown size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => layer('up')} title="Bring Forward"><ArrowUp size={14} /></button>
                <button className="icon-btn btn-xs" onClick={() => layer('down')} title="Send Backward"><ArrowDown size={14} /></button>
            </div>

            {isGroup && (
                <div className="inputs-grid-4">
                    <button className="icon-btn btn-xs" onClick={() => canvasManager.group()} title="Group Objects">
                        <FolderPlus size={14} />
                    </button>
                    <button className="icon-btn btn-xs" onClick={() => canvasManager.ungroup()} title="Ungroup Objects">
                        <FolderMinus size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
