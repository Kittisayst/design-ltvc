import React from 'react';

/**
 * Renders SVG shape icons for the element grid.
 */
export function renderShapeIcon(shapeType, color = '#ccc') {
    const style = { width: '100%', height: '100%', display: 'block' };

    switch (shapeType) {
        case 'rect':
            return <svg viewBox="0 0 100 100" style={style}><rect x="10" y="25" width="80" height="50" fill={color} rx="4" /></svg>;
        case 'circle':
            return <svg viewBox="0 0 100 100" style={style}><circle cx="50" cy="50" r="40" fill={color} /></svg>;
        case 'triangle':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="50,15 15,85 85,85" fill={color} /></svg>;
        case 'right_triangle':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="20,20 20,80 80,80" fill={color} /></svg>;
        case 'diamond':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="50,20 80,50 50,80 20,50" fill={color} /></svg>;
        case 'parallelogram':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="30,20 90,20 70,80 10,80" fill={color} /></svg>;
        case 'trapezoid':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="30,20 70,20 90,80 10,80" fill={color} /></svg>;
        case 'star':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
        case 'pentagon':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9 12 2z" /></svg>;
        case 'hexagon':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M21 16.5l-9 5.2-9-5.2v-9l9-5.2 9 5.2v9z" /></svg>;
        case 'cross':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="35,20 65,20 65,35 80,35 80,65 65,65 65,80 35,80 35,65 20,65 20,35 35,35" fill={color} /></svg>;
        case 'cloud':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>;
        case 'burst':
            return <svg viewBox="0 0 100 100" style={style}><polygon points="50,10 60,35 85,25 75,45 95,60 70,70 65,95 50,80 35,95 30,70 5,60 25,45 15,25 40,35" fill={color} /></svg>;
        case 'lightning':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>;
        case 'arrow':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M5 12h10v5l5-5-5-5v5H5v-5z" /></svg>;
        case 'message_box':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>;
        case 'heart':
            return <svg viewBox="0 0 24 24" style={style}><path fill={color} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
        default:
            return <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '4px' }} />;
    }
}
