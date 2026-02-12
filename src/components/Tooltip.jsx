import React, { useState, useRef, useCallback } from 'react';

export function Tooltip({ children, content, shortcut, position = 'bottom', delay = 400 }) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef(null);
    const triggerRef = useRef(null);

    const show = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            let x, y;

            switch (position) {
                case 'top':
                    x = rect.left + rect.width / 2;
                    y = rect.top - 6;
                    break;
                case 'bottom':
                    x = rect.left + rect.width / 2;
                    y = rect.bottom + 6;
                    break;
                case 'left':
                    x = rect.left - 6;
                    y = rect.top + rect.height / 2;
                    break;
                case 'right':
                    x = rect.right + 6;
                    y = rect.top + rect.height / 2;
                    break;
                default:
                    x = rect.left + rect.width / 2;
                    y = rect.bottom + 6;
            }

            setCoords({ x, y });
            setVisible(true);
        }, delay);
    }, [position, delay]);

    const hide = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setVisible(false);
    }, []);

    if (!content) return children;

    return (
        <>
            <span
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                style={{ display: 'inline-flex' }}
            >
                {children}
            </span>
            {visible && (
                <div
                    className={`tooltip tooltip-${position}`}
                    style={{
                        position: 'fixed',
                        left: `${coords.x}px`,
                        top: `${coords.y}px`,
                    }}
                    role="tooltip"
                >
                    <span className="tooltip-text">{content}</span>
                    {shortcut && <kbd className="tooltip-kbd">{shortcut}</kbd>}
                </div>
            )}
        </>
    );
}
