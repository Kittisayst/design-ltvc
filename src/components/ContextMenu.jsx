import React, { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock, Layers, ArrowLeftRight, ArrowUpDown, Wand2, Crop } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import BackgroundRemovalService from '../services/BackgroundRemovalService';
import { NotificationManager } from '../core/NotificationManager';

export function ContextMenu() { // No props needed
    const { canvasManager } = useCanvas();
    const menuRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeObject, setActiveObject] = useState(null);

    useEffect(() => {
        if (!canvasManager) return;
        // ... (Lines 16-62 unchanged)
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Implementing logic similar to App.jsx original logic
        const onContextMenu = (e) => {
            // Check if target is inside 'canvas-wrapper'
            const wrapper = document.getElementById('canvas-wrapper');
            if (wrapper && wrapper.contains(e.target)) {
                e.preventDefault();
                const target = canvasManager.canvas.findTarget(e);
                if (target) {
                    canvasManager.canvas.setActiveObject(target);
                    canvasManager.canvas.requestRenderAll();
                    setActiveObject(target);
                    setPosition({ x: e.clientX, y: e.clientY });
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        };

        const onCustomContextMenu = (e) => {
            const { target, x, y } = e.detail;
            if (target) {
                // Ensure it's selected (LayersPanel usually selects it first)
                canvasManager.canvas.setActiveObject(target);
                canvasManager.canvas.requestRenderAll();
                setActiveObject(target);
                setPosition({ x, y });
                setVisible(true);
            }
        };

        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('canvas:contextmenu', onCustomContextMenu);

        return () => {
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('canvas:contextmenu', onCustomContextMenu);
        };
    }, [canvasManager]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setVisible(false);
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);

            // Boundary detection
            if (menuRef.current) {
                const menu = menuRef.current;
                const rect = menu.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let { x, y } = position;

                // Check bottom edge
                if (y + rect.height > viewportHeight) {
                    y = viewportHeight - rect.height - 10;
                }

                // Check right edge
                if (x + rect.width > viewportWidth) {
                    x = viewportWidth - rect.width - 10;
                }

                // Check top edge
                if (y < 0) y = 10;

                // Check left edge
                if (x < 0) x = 10;

                // Apply corrected position
                menu.style.top = `${y}px`;
                menu.style.left = `${x}px`;
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, position]);

    const handleAction = async (action) => {
        if (!canvasManager) return;

        switch (action) {
            case 'duplicate':
                canvasManager.duplicateActiveObject();
                break;
            case 'delete':
                canvasManager.removeActiveObject();
                break;
            case 'layer-up':
                canvasManager.layerActiveObject('up');
                break;
            case 'layer-down':
                canvasManager.layerActiveObject('down');
                break;
            case 'group':
                canvasManager.group();
                break;
            case 'ungroup':
                canvasManager.ungroup();
                break;
            case 'lock':
                canvasManager.toggleLockActiveObject();
                break;
            case 'flip-h':
                canvasManager.flipActiveObject('horizontal');
                break;
            case 'flip-v':
                canvasManager.flipActiveObject('vertical');
                break;
            case 'start-crop':
                canvasManager.startCropMode();
                setVisible(false);
                break;
            case 'remove-bg':
                setVisible(false); // Close menu first
                NotificationManager.info("Removing background...", 2000);
                try {
                    const src = activeObject.getSrc();
                    const blob = await BackgroundRemovalService.removeBackground(src);
                    const newUrl = URL.createObjectURL(blob);
                    await canvasManager.replaceImage(activeObject, newUrl);
                    NotificationManager.success("Background removed!");
                } catch (err) {
                    console.error("BG Removal error:", err);
                    NotificationManager.error("Failed to remove background");
                }
                return; // already closed
            case 'vectorize':
                setVisible(false);
                await canvasManager.vectorizeActiveImage();
                break;
        }
        setVisible(false);
    };

    if (!visible) return null;

    const isLocked = activeObject?.lockMovementX;
    const isGroup = activeObject?.type === 'group';
    const isSelection = activeObject?.type === 'activeSelection' || activeObject?.type === 'activeselection';
    const isImage = activeObject && (activeObject.type === 'image' || activeObject.type === 'fabric-image');

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                top: position.y,
                left: position.x
            }}
        >
            {isImage && (
                <>
                    <MenuItem
                        icon={<Crop size={16} />}
                        label="Crop Image"
                        onClick={() => handleAction('start-crop')}
                    />
                    <MenuItem
                        icon={<Wand2 size={16} />}
                        label="Remove Background"
                        onClick={() => handleAction('remove-bg')}
                    />
                    <MenuItem
                        icon={<Layers size={16} />}
                        label="Convert to Vector"
                        onClick={() => handleAction('vectorize')}
                    />
                    <div className="menu-divider"></div>
                </>
            )}

            <MenuItem
                icon={<Copy size={16} />}
                label="Duplicate"
                shortcut="Ctrl+D"
                onClick={() => handleAction('duplicate')}
            />

            <div className="menu-divider"></div>

            <MenuItem
                icon={<ArrowLeftRight size={16} />}
                label="Flip Horizontal"
                onClick={() => handleAction('flip-h')}
            />
            <MenuItem
                icon={<ArrowUpDown size={16} />}
                label="Flip Vertical"
                onClick={() => handleAction('flip-v')}
            />

            <div className="menu-divider"></div>

            <MenuItem
                icon={<ArrowUp size={16} />}
                label="Bring Forward"
                shortcut="Ctrl+]"
                onClick={() => handleAction('layer-up')}
            />
            <MenuItem
                icon={<ArrowDown size={16} />}
                label="Send Backward"
                shortcut="Ctrl+["
                onClick={() => handleAction('layer-down')}
            />

            <div className="menu-divider"></div>

            <MenuItem
                icon={isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                label={isLocked ? "Unlock" : "Lock"}
                shortcut="Ctrl+L"
                onClick={() => handleAction('lock')}
            />

            {isGroup && (
                <MenuItem
                    icon={<Layers size={16} />}
                    label="Ungroup"
                    onClick={() => handleAction('ungroup')}
                />
            )}

            {!isGroup && isSelection && (
                <MenuItem
                    icon={<Layers size={16} />}
                    label="Group"
                    shortcut="Ctrl+G"
                    onClick={() => handleAction('group')}
                />
            )}


            <div className="menu-divider"></div>

            <MenuItem
                icon={<Trash2 size={16} />}
                label="Delete"
                shortcut="Del"
                danger
                onClick={() => handleAction('delete')}
            />
        </div>
    );
}

function MenuItem({ icon, label, shortcut, onClick, danger = false }) {
    return (
        <button
            className={`menu-item ${danger ? 'danger' : ''}`}
            onClick={onClick}
        >
            <span className="menu-icon">{icon}</span>
            <span className="menu-label">{label}</span>
            {shortcut && <span className="menu-shortcut">{shortcut}</span>}
        </button>
    );
}
