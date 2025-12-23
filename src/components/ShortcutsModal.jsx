import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SHORTCUTS = [
    {
        category: 'General',
        items: [

            { keys: ['Del'], desc: 'Delete' },
            { keys: ['Esc'], desc: 'Deselect / Cancel' },
        ]
    },
    {
        category: 'Clipboard',
        items: [
            { keys: ['Ctrl', 'C'], desc: 'Copy' },
            { keys: ['Ctrl', 'V'], desc: 'Paste' },
            { keys: ['Ctrl', 'D'], desc: 'Duplicate' },
        ]
    },
    {
        category: 'Manipulation',
        items: [
            { keys: ['Arrows'], desc: 'Nudge Object' },
            { keys: ['Shift', 'Arrows'], desc: 'Nudge x10' },
            { keys: ['Shift', 'Drag'], desc: 'Constrain Rotate/Scale' },
        ]
    },
    {
        category: 'View',
        items: [
            { keys: ['Space', 'Drag'], desc: 'Pan Canvas (Hand Tool)' },
            { keys: ['Alt', 'Wheel'], desc: 'Zoom In/Out' },
        ]
    }
];

export function ShortcutsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content shortcuts-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="shortcuts-grid">
                    {SHORTCUTS.map(cat => (
                        <div key={cat.category} className="shortcut-category">
                            <h3>{cat.category}</h3>
                            <ul>
                                {cat.items.map((item, idx) => (
                                    <li key={idx}>
                                        <div className="keys">
                                            {item.keys.map((k, i) => (
                                                <React.Fragment key={k}>
                                                    <span className="kbd">{k}</span>
                                                    {i < item.keys.length - 1 && <span className="plus">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <span className="desc">{item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .shortcuts-modal {
                    max-width: 800px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    background: #1e1e1e;
                    color: #fff;
                    border: 1px solid #333;
                }
                .shortcuts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    padding: 20px;
                }
                .shortcut-category h3 {
                    margin-bottom: 12px;
                    color: #888;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 8px;
                }
                .shortcut-category ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .shortcut-category li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #2a2a2a;
                }
                .shortcut-category li:last-child {
                    border-bottom: none;
                }
                .keys {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .kbd {
                    background: #333;
                    border: 1px solid #444;
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-family: monospace;
                    font-size: 12px;
                    color: #eee;
                    box-shadow: 0 2px 0 #222;
                }
                .plus {
                    color: #666;
                    font-size: 12px;
                }
                .desc {
                    color: #ccc;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
}
