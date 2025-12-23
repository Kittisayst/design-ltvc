import { Copy, Lock, Download, FolderOpen } from 'lucide-react';
import { useRef } from 'react';

export function ActionButtons({ canvasManager, onExport }) {

    const fileInputRef = useRef(null);

    const handleDuplicate = () => {
        canvasManager?.duplicateActiveObject();
    };

    const handleLock = () => {
        canvasManager?.toggleLockActiveObject();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            try {
                const json = JSON.parse(f.target.result);
                // We use loadProject instead of loadTemplate for full restore
                canvasManager.loadProject(json);
            } catch (err) {
                console.error("Failed to load JSON", err);
                alert("Failed to load project file.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="nav-actions navbar-group">
            <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Import Button */}
            <button className="icon-btn" onClick={handleImportClick} title="Import JSON Project">
                <FolderOpen size={16} />
            </button>

            {/* Export Button (Triggers Global Modal) */}
            <button className="icon-btn" onClick={onExport} title="Export Design">
                <Download size={16} />
            </button>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }}></div>

            <button
                id="btn-duplicate"
                className="icon-btn"
                onClick={handleDuplicate}
                title="Duplicate"
            >
                <Copy size={16} />
            </button>
            <button
                id="btn-lock"
                className="icon-btn"
                onClick={handleLock}
                title="Lock/Unlock"
            >
                <Lock size={16} />
            </button>
        </div>
    );
}
