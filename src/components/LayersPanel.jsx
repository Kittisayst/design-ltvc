import React, { useState, useEffect, memo } from 'react';
import { GripVertical, Type, Image, Square, Circle, Folder, Box, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import * as fabric from 'fabric';

// Extracted LayerItem for performance
const LayerItem = memo(({
    obj,
    index,
    isSelected,
    isDragging,
    isEditing,
    editingName,
    onSelect,
    onToggleLock,
    onToggleVisible,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onNameDoubleClick,
    onNameChange,
    onNameKeyDown,
    onNameBlur
}) => {
    const name = obj.name || obj.type;
    const isLocked = obj.lockMovementX;
    const isVisible = obj.visible !== false;

    const getIcon = (type) => {
        switch (type) {
            case 'i-text':
            case 'text': return <Type size={14} />;
            case 'image': return <Image size={14} />;
            case 'rect': return <Square size={14} />;
            case 'circle': return <Circle size={14} />;
            case 'group': return <Folder size={14} />;
            default: return <Box size={14} />;
        }
    };

    return (
        <div
            className={`layer-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={(e) => onSelect(obj, e)}
            draggable={true}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            style={{
                cursor: 'pointer',
                opacity: isDragging ? 0.5 : 1
            }}
        >
            <div className="layer-handle" style={{ cursor: 'grab' }}>
                <GripVertical size={14} />
            </div>
            <div className="layer-icon">
                {getIcon(obj.type)}
            </div>
            <div className="layer-name-wrap" style={{ flex: 1, overflow: 'hidden' }} onDoubleClick={(e) => onNameDoubleClick(obj, e)}>
                {isEditing ? (
                    <input
                        type="text"
                        value={editingName}
                        onChange={onNameChange}
                        onKeyDown={(e) => onNameKeyDown(e, obj)}
                        onBlur={() => onNameBlur(obj)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            border: '1px solid var(--accent-primary)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            padding: '2px 4px',
                            fontSize: 'inherit',
                            borderRadius: '2px',
                            outline: 'none'
                        }}
                    />
                ) : (
                    <span className="layer-name">{name}</span>
                )}
            </div>
            <div className="layer-actions">
                <button
                    className={`icon-btn btn-xs btn-lock ${isLocked ? 'active' : ''}`}
                    onClick={(e) => onToggleLock(obj, e)}
                    title="Lock/Unlock"
                >
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <button
                    className={`icon-btn btn-xs btn-visible ${!isVisible ? 'active' : ''}`}
                    onClick={(e) => onToggleVisible(obj, e)}
                    title="Toggle Visibility"
                >
                    {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
            </div>
        </div>
    );
});

export function LayersPanel({ canvasManager }) {
    const [layers, setLayers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        if (!canvasManager) return;

        const updateLayers = () => {
            // Create a new array reference but try to keep object references stable? 
            // Fabric objects are objects. 
            const objects = canvasManager.canvas.getObjects().filter(obj => !obj.excludeFromExport);
            setLayers([...objects].reverse());
        };

        const updateSelection = () => {
            const active = canvasManager.getActiveObject();
            if (active) {
                if (active.type === 'activeSelection') {
                    const ids = active.getObjects().map(obj => obj.uid || obj);
                    setSelectedIds(ids);
                } else {
                    setSelectedIds([active.uid || active]);
                }
            } else {
                setSelectedIds([]);
            }
        };

        canvasManager.canvas.on('object:added', updateLayers);
        canvasManager.canvas.on('object:removed', updateLayers);
        canvasManager.canvas.on('object:modified', updateLayers);
        // We also need to listen to 'layer:updated' or similar if we move layers programmatically without modifying object props?
        // Fabric doesn't strictly have a 'layer:changed' event, but 'object:added/removed' handles most. z-index changes don't fire events always.
        // But our manager operations methods should trigger render?

        canvasManager.canvas.on('selection:created', updateSelection);
        canvasManager.canvas.on('selection:updated', updateSelection);
        canvasManager.canvas.on('selection:cleared', updateSelection);
        canvasManager.canvas.on('layer:updated', updateLayers); // Custom event listener

        updateLayers();
        updateSelection();

        return () => {
            if (canvasManager.canvas) {
                canvasManager.canvas.off('object:added', updateLayers);
                canvasManager.canvas.off('object:removed', updateLayers);
                canvasManager.canvas.off('object:modified', updateLayers);
                canvasManager.canvas.off('selection:created', updateSelection);
                canvasManager.canvas.off('selection:updated', updateSelection);
                canvasManager.canvas.off('selection:cleared', updateSelection);
                canvasManager.canvas.off('layer:updated', updateLayers);
            }
        };
    }, [canvasManager]);

    // ... Handlers (Keeping mostly same logic but passing to LayerItem)
    const handleSelect = (obj, e) => {
        if (!canvasManager) return;
        const canvas = canvasManager.canvas;
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            const active = canvas.getActiveObject();
            let newSelection = [];
            if (active) {
                if (active.type === 'activeSelection') newSelection = [...active.getObjects()];
                else newSelection = [active];
            }
            const index = newSelection.indexOf(obj);
            if (index > -1) {
                if (e.ctrlKey || e.metaKey) newSelection.splice(index, 1);
            } else {
                newSelection.push(obj);
            }
            if (newSelection.length === 0) canvas.discardActiveObject();
            else if (newSelection.length === 1) canvas.setActiveObject(newSelection[0]);
            else {
                const sel = new fabric.ActiveSelection(newSelection, { canvas: canvas });
                canvas.setActiveObject(sel);
            }
        } else {
            canvas.discardActiveObject();
            canvas.setActiveObject(obj);
        }
        canvas.requestRenderAll();
    };

    const handleToggleLock = (obj, e) => {
        e.stopPropagation();
        const val = !obj.lockMovementX;
        obj.set({
            lockMovementX: val,
            lockMovementY: val,
            lockRotation: val,
            lockScalingX: val,
            lockScalingY: val
        });
        canvasManager.canvas.requestRenderAll();
        // Force update since 'object:modified' might not fire for programmatic set (it usually doesn't)
        setLayers([...canvasManager.canvas.getObjects()].reverse());
    };

    const handleToggleVisible = (obj, e) => {
        e.stopPropagation();
        obj.set('visible', !obj.visible);
        canvasManager.canvas.requestRenderAll();
        setLayers([...canvasManager.canvas.getObjects()].reverse());
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }
        const allObjects = canvasManager.canvas.getObjects();
        const total = allObjects.length;
        const fabricDragIndex = total - 1 - draggedIndex;
        let fabricDropIndex = total - 1 - dropIndex;

        if (canvasManager.objectManager && canvasManager.objectManager.reorder) {
            // If ObjectManager has reorder logic, use it. 
            // Currently CanvasManager delegates layering but maybe not arbitrary move?
            // Let's use direct canvas move for now or check if we added reorder.
            const obj = allObjects[fabricDragIndex];
            canvasManager.canvas.moveObjectTo(obj, fabricDropIndex); // Standard fabric
        } else {
            const obj = allObjects[fabricDragIndex];
            canvasManager.canvas.moveObjectTo(obj, fabricDropIndex);
        }

        canvasManager.canvas.requestRenderAll();
        setLayers([...canvasManager.canvas.getObjects()].reverse());
        setDraggedIndex(null);
    };

    const handleDragEnd = () => setDraggedIndex(null);

    const handleNameDoubleClick = (obj, e) => {
        e.stopPropagation();
        setEditingId(obj.uid || obj);
        setEditingName(obj.name || obj.type);
    };

    const handleNameChange = (e) => setEditingName(e.target.value);

    const handleNameKeyDown = (e, obj) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            obj.set('name', editingName);
            setEditingId(null);
            canvasManager.canvas.requestRenderAll();
            setLayers([...canvasManager.canvas.getObjects()].reverse());
        } else if (e.key === 'Escape') setEditingId(null);
    };

    const handleNameBlur = (obj) => {
        obj.set('name', editingName);
        setEditingId(null);
        canvasManager.canvas.requestRenderAll();
        setLayers([...canvasManager.canvas.getObjects()].reverse());
    };

    return (
        <div className="layers-list">
            {layers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9em' }}>
                    No objects yet
                </div>
            ) : (
                layers.map((obj, index) => (
                    <LayerItem
                        key={obj.uid || index}
                        obj={obj}
                        index={index}
                        isSelected={selectedIds.includes(obj.uid || obj)}
                        isDragging={draggedIndex === index}
                        isEditing={editingId === (obj.uid || obj)}
                        editingName={editingName}
                        onSelect={handleSelect}
                        onToggleLock={handleToggleLock}
                        onToggleVisible={handleToggleVisible}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onNameDoubleClick={handleNameDoubleClick}
                        onNameChange={handleNameChange}
                        onNameKeyDown={handleNameKeyDown}
                        onNameBlur={handleNameBlur}
                    />
                ))
            )}
        </div>
    );
}
