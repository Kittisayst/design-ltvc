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
        <div className="page-navigator">
            {/* Page Thumbnails */}
            <div className="page-thumbnails">
                {pages.map((page, i) => (
                    <div
                        key={page.id}
                        className={`page-thumb ${page.active ? 'active' : ''}`}
                        onClick={() => handleSwitchPage(i)}
                        title={page.label}
                    >
                        {page.thumbnail ? (
                            <img src={page.thumbnail} alt={page.label} />
                        ) : (
                            <div className="page-thumb-placeholder">{i + 1}</div>
                        )}

                        <span className="page-thumb-number">{i + 1}</span>

                        {pages.length > 1 && page.active && (
                            <button
                                className="page-thumb-delete"
                                onClick={(e) => handleDeletePage(e, i)}
                                title="Delete Page"
                                aria-label="Delete Page"
                            >
                                <Trash2 size={8} color="#fff" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="page-actions">
                <button className="page-action-btn" onClick={handleAddPage} title="Add Page" aria-label="Add Page">
                    <Plus size={16} />
                </button>
                <button className="page-action-btn" onClick={handleDuplicatePage} title="Duplicate Page" aria-label="Duplicate Page">
                    <Copy size={14} />
                </button>
            </div>

            <span className="page-counter">
                {currentIndex + 1} / {pages.length}
            </span>
        </div>
    );
}
