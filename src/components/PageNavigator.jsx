import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

export function PageNavigator() {
    const { canvasManager } = useCanvas();
    const [pages, setPages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!canvasManager?.pageManager) return;

        const pm = canvasManager.pageManager;
        pm.onPagesChange = (pagesInfo) => {
            setPages(pagesInfo);
            setCurrentIndex(pm.getCurrentPageIndex());
        };

        // Initial load
        setPages(pm.getPages());
        setCurrentIndex(pm.getCurrentPageIndex());

        return () => { pm.onPagesChange = null; };
    }, [canvasManager]);

    const handleSwitchPage = useCallback(async (index) => {
        if (!canvasManager?.pageManager) return;
        await canvasManager.pageManager.switchToPage(index);
    }, [canvasManager]);

    const handleAddPage = useCallback(async () => {
        if (!canvasManager?.pageManager) return;
        await canvasManager.pageManager.addPage();
    }, [canvasManager]);

    const handleDuplicatePage = useCallback(async () => {
        if (!canvasManager?.pageManager) return;
        await canvasManager.pageManager.duplicatePage();
    }, [canvasManager]);

    const handleDeletePage = useCallback(async (e, index) => {
        e.stopPropagation();
        if (!canvasManager?.pageManager) return;
        await canvasManager.pageManager.deletePage(index);
    }, [canvasManager]);

    if (!canvasManager?.pageManager || pages.length === 0) return null;

    return (
        <div className="page-navigator" style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            borderRadius: '8px 8px 0 0',
            zIndex: 50,
            maxWidth: '80vw',
            overflowX: 'auto'
        }}>
            {/* Page Thumbnails */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {pages.map((page, i) => (
                    <div
                        key={page.id}
                        onClick={() => handleSwitchPage(i)}
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            border: page.active ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            width: '64px',
                            height: '48px',
                            background: 'var(--bg-tertiary)',
                            flexShrink: 0,
                            transition: 'border-color 0.15s'
                        }}
                        title={page.label}
                    >
                        {page.thumbnail ? (
                            <img src={page.thumbnail} alt={page.label}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', color: 'var(--text-secondary)'
                            }}>{i + 1}</div>
                        )}

                        {/* Page number badge */}
                        <span style={{
                            position: 'absolute', bottom: '1px', left: '2px',
                            fontSize: '8px', color: 'var(--text-secondary)',
                            background: 'rgba(0,0,0,0.5)', padding: '0 3px',
                            borderRadius: '2px', lineHeight: '14px'
                        }}>{i + 1}</span>

                        {/* Delete button (only if > 1 page) */}
                        {pages.length > 1 && page.active && (
                            <button
                                onClick={(e) => handleDeletePage(e, i)}
                                style={{
                                    position: 'absolute', top: '1px', right: '1px',
                                    width: '14px', height: '14px',
                                    background: 'rgba(239,68,68,0.8)', border: 'none',
                                    borderRadius: '2px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 0
                                }}
                                title="Delete Page"
                            >
                                <Trash2 size={8} color="#fff" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                <button onClick={handleAddPage} title="Add Page" style={{
                    width: '32px', height: '32px', borderRadius: '4px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Plus size={16} />
                </button>
                <button onClick={handleDuplicatePage} title="Duplicate Page" style={{
                    width: '32px', height: '32px', borderRadius: '4px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Copy size={14} />
                </button>
            </div>

            {/* Page Counter */}
            <span style={{
                fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: '4px'
            }}>
                {currentIndex + 1} / {pages.length}
            </span>
        </div>
    );
}
