export class FontManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    get canvas() {
        return this.canvasManager.canvas;
    }

    loadGoogleFont(fontName) {
        if (!fontName) return;

        // standard fonts skip
        const standard = [
            'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Impact',
            'Noto Sans Lao Looped', 'Noto Serif Lao', 'Phetsarath OT', 'Noto Sans Lao'
        ];
        if (standard.some(s => fontName.includes(s))) return;

        // Clean font name (remove single quotes)
        const family = fontName.replace(/['"]/g, '').split(',')[0].trim();
        const id = 'font-css-' + family.replace(/\s+/g, '-').toLowerCase();

        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
            document.head.appendChild(link);

            // Wait for load? Fabric often needs a re-render after font load.
            link.onload = () => {
                this.canvas.requestRenderAll();
            };
        }
    }

    setTextStyle(prop, value) {
        const active = this.canvasManager.getActiveObject();
        if (active && active.type === 'i-text') {
            if (prop === 'fontFamily') {
                this.loadGoogleFont(value);
            }
            active.set(prop, value);
            this.canvas.requestRenderAll();

        }
    }


    toggleTextDecoration(prop) {
        const active = this.canvasManager.getActiveObject();
        if (active && active.type === 'i-text') {
            if (prop === 'fontWeight') {
                const isBold = active.fontWeight === 'bold';
                active.set('fontWeight', isBold ? 'normal' : 'bold');
            } else if (prop === 'fontStyle') {
                const isItalic = active.fontStyle === 'italic';
                active.set('fontStyle', isItalic ? 'normal' : 'italic');
            } else if (prop === 'underline') {
                active.set('underline', !active.underline);
            }
            this.canvas.requestRenderAll();

        }
        return active[prop];
    }
}
