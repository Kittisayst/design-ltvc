import React from 'react';
import { useCanvas } from '../context/CanvasContext';
import { RotateCcw, Trash2, Check, Clock } from 'lucide-react';

export function HistoryPanel({ onClose }) {
    const { history, historyIndex, canvasManager } = useCanvas();

    const handleJump = (index) => {
        if (canvasManager && canvasManager.history) {
            canvasManager.history.jumpTo(index);
        }
    };

    const handleClear = () => {
        if (confirm('Clear entire history?')) {
            if (canvasManager && canvasManager.history) {
                canvasManager.history.clear();
            }
        }
    };

    return (
        <div className="history-panel" style={{
            position: 'absolute',
            top: '45px',
            left: '0',
            width: '240px',
            maxHeight: '400px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            <div className="panel-header" style={{
                padding: '12px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
            }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>History</h3>
                <button
                    className="icon-btn btn-sm btn-danger"
                    onClick={handleClear}
                    title="Clear History"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="history-list" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px'
            }}>
                {history.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                        No history yet
                    </div>
                ) : (
                    history.map((item, index) => {
                        const isCurrent = index === historyIndex;
                        const isFuture = index > historyIndex;

                        return (
                            <div
                                key={item.id || index}
                                className={`history-item ${isCurrent ? 'active' : ''}`}
                                onClick={() => handleJump(index)}
                                style={{
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.85rem',
                                    backgroundColor: isCurrent ? 'var(--accent-primary-alpha)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    opacity: isFuture ? 0.5 : 1,
                                    border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '30px',
                                    backgroundColor: '#fff',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border-color)',
                                    flexShrink: 0
                                }}>
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 500,
                                        textDecoration: isFuture ? 'line-through' : 'none',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.label || 'Action'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>

                                {isCurrent && <Check size={14} style={{ flexShrink: 0 }} />}
                            </div>
                        );
                    })
                )}

            </div>
        </div>
    );
}
