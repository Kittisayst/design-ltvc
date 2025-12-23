import React, { useState, useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { TransformPanel } from './properties/TransformPanel';
import { TextPanel } from './properties/TextPanel';
import { StylePanel } from './properties/StylePanel';
import { ImageEffectsPanel } from './properties/ImageEffectsPanel';
import { ArrangementPanel } from './properties/ArrangementPanel';
import { DocumentPalette } from './properties/DocumentPalette';

export function PropertyPanel() {
    const { canvasManager, activeObject } = useCanvas();
    const [, forceUpdate] = useState({});

    // Listen for object modification to update UI (dragging, resizing)
    useEffect(() => {
        if (!canvasManager || !canvasManager.canvas) return;

        const handleUpdate = () => forceUpdate({});

        canvasManager.canvas.on('object:modified', handleUpdate);
        // We might also need 'object:scaling', 'object:moving' if we want live updates?
        // Usually 'modified' is enough (mouse up). Live updates might be too frequent for React rerenders.

        return () => {
            if (canvasManager.canvas) {
                canvasManager.canvas.off('object:modified', handleUpdate);
            }
        };
    }, [canvasManager]);

    // Handler for programmatic updates
    const handleUpdate = (prop, value) => {
        if (canvasManager && activeObject) {
            canvasManager.updateActiveObject(prop, value);
            forceUpdate({}); // Force UI refresh
        }
    };

    if (!activeObject) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9em' }}>
                Select an object
            </div>
        );
    }

    const type = activeObject.type;
    const isText = type === 'i-text' || type === 'text';
    const isImage = type === 'image' || type === 'fabric-image';
    const isGroup = type === 'group' || type === 'activeSelection' || type === 'activeselection';
    const isShape = ['rect', 'circle', 'triangle', 'polygon', 'path', 'line'].includes(type);

    return (
        <div className="property-panel">
            <DocumentPalette onUpdate={handleUpdate} />
            <TransformPanel activeObject={activeObject} onUpdate={handleUpdate} />

            {isText && (
                <TextPanel
                    activeObject={activeObject}
                    canvasManager={canvasManager}
                    onUpdate={handleUpdate}
                />
            )}

            {/* Show StylePanel for Shapes, Groups, and Text (for color) */}
            {(isShape || isGroup || isText) && (
                <StylePanel
                    activeObject={activeObject}
                    onUpdate={handleUpdate}
                />
            )}

            {/* Image specific panel */}
            {isImage && (
                <ImageEffectsPanel
                    activeObject={activeObject}
                    canvasManager={canvasManager}
                    onUpdate={handleUpdate}
                />
            )}

            {/* StylePanel for Images? Only Shadow/Stroke? 
                 ImageEffectsPanel handles Tint (Fill). 
                 StylePanel handles Stroke/Shadow. 
                 If we want stroke/shadow for images, we can enable it but must check fill conflict.
                 For now, keep simple: No StylePanel for images (as per config).
             */}

            <div className="section-divider my-2"></div>
            <ArrangementPanel
                activeObject={activeObject}
                canvasManager={canvasManager}
            />
        </div>
    );
}
