
import { jsPDF } from 'jspdf';
import { NotificationManager } from './NotificationManager.js';

export class ExportPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
    }

    init() {
        this.setupBindings();
    }

    setupBindings() {
        // Save Project
        document.getElementById('btn-save-project').addEventListener('click', () => {
            const json = this.cm.saveProject();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.json';
            a.click();
            URL.revokeObjectURL(url);
            NotificationManager.success('Project saved!');
        });

        // Load Project
        const loadInput = document.getElementById('load-file-input');
        document.getElementById('btn-load-project').addEventListener('click', () => {
            loadInput.click();
        });

        loadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (f) => {
                this.cm.loadProject(f.target.result);
                loadInput.value = '';
                NotificationManager.success('Project loaded!');
            };
            reader.readAsText(file);
        });

        // Export Image/PDF
        const btnExport = document.getElementById('btn-do-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                const nameInput = document.getElementById('export-name');
                const qualityInput = document.getElementById('export-quality');
                const formatInput = document.querySelector('input[name="export-format"]:checked');

                const filename = nameInput.value || 'design';
                const quality = parseInt(qualityInput.value, 10) || 1;
                const format = formatInput ? formatInput.value : 'png';

                if (format === 'png') {
                    this.cm.exportToImage(filename, quality);
                    NotificationManager.success('Exporting PNG...');
                } else if (format === 'pdf') {
                    try {
                        const canvas = this.cm.canvas;
                        const w = canvas.width;
                        const h = canvas.height;
                        const imgData = this.cm.getCanvasDataURL(quality);
                        const pdf = new jsPDF({ orientation: w > h ? 'l' : 'p', unit: 'px', format: [w, h] });
                        pdf.addImage(imgData, 'PNG', 0, 0, w, h);
                        pdf.save(`${filename}.pdf`);
                        NotificationManager.success('Exporting PDF...');
                    } catch (err) {
                        NotificationManager.error('PDF export failed.');
                        console.error(err);
                    }
                }
            });
        }
    }
}
