import { useCallback, useRef } from 'react';

export function ResizeHandle({ side, minWidth = 200, maxWidth = 500, onResize }) {
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        const parentEl = e.target.parentElement;
        if (!parentEl) return;

        startXRef.current = e.clientX;
        startWidthRef.current = parentEl.offsetWidth;

        const handleMouseMove = (moveE) => {
            const delta = side === 'left'
                ? moveE.clientX - startXRef.current
                : startXRef.current - moveE.clientX;
            const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
            parentEl.style.width = `${newWidth}px`;
            if (onResize) onResize(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [side, minWidth, maxWidth, onResize]);

    return (
        <div
            className={`resize-handle resize-handle-${side}`}
            onMouseDown={handleMouseDown}
        />
    );
}
