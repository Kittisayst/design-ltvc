import { NotificationManager } from './NotificationManager.js';

export class TemplatesPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
        this.templates = [];
    }

    init() {
        this.injectControls();
        this.loadTemplates();
    }

    injectControls() {
        const wrapper = document.getElementById('templates-wrapper');
        if (!wrapper) return;

        // Locate title and append button or insert specific control area
        const title = wrapper.querySelector('.section-title');
        if (title) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-primary';
            btn.style.marginTop = '8px';
            btn.style.width = '100%';
            btn.innerHTML = '<i data-lucide="save"></i> Save Current as Template';
            btn.addEventListener('click', () => this.saveAsTemplate());

            // Insert after title
            title.parentNode.insertBefore(btn, title.nextSibling);
        }
    }

    async loadTemplates() {
        try {
            const res = await fetch('/data/templates.json');
            if (res.ok) {
                this.templates = await res.json();
            }
            this.render();
        } catch (err) {
            console.error('Failed to load templates:', err);
            // Fallback if file missing
            this.templates = [];
            this.render();
        }
    }

    render() {
        const container = document.getElementById('templates-grid'); // We will add this ID to HTML
        if (!container) return;

        container.innerHTML = '';

        // Prepend "Create Blank"
        const blankCard = document.createElement('div');
        blankCard.className = 'template-card';
        blankCard.innerHTML = `
            <div class="template-thumb" style="background: #ffffff; display:flex; align-items:center; justify-content:center;">
                <span style="color:#ccc; font-size: 3rem;">+</span>
            </div>
            <div class="template-info">
                <h4>Blank Canvas</h4>
                <span class="template-cat">New</span>
            </div>
        `;
        blankCard.addEventListener('click', () => {
            if (confirm('Start fresh? Unsaved changes will be lost.')) {
                this.cm.loadTemplate(null);
            }
        });
        container.appendChild(blankCard);

        this.templates.forEach(tpl => {
            const card = document.createElement('div');
            card.className = 'template-card';

            // Handle thumbnail: if it's a data URL or relative path
            let thumbSrc = tpl.thumbnail;
            if (thumbSrc && !thumbSrc.startsWith('data:') && !thumbSrc.startsWith('http')) {
                // If relative, assume it's relative to root or handled 
                // For this demo, we use absolute or placeholder
                if (thumbSrc.startsWith('template/')) {
                    // Since we didn't mock thumbnails on disk, we might break unless they are external
                    // Only 'example01' uses placeholder.co in json.
                }
            }

            card.innerHTML = `
                <div class="template-thumb">
                    <img src="${thumbSrc}" alt="${tpl.title}" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                </div>
                <div class="template-info">
                    <h4>${tpl.title}</h4>
                    <span class="template-cat">${tpl.category || 'Custom'}</span>
                </div>
            `;

            card.addEventListener('click', async () => {
                if (confirm(`Load template "${tpl.title}"? Unsaved changes will be lost.`)) {
                    await this.loadTemplate(tpl);
                }
            });

            container.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    async loadTemplate(tpl) {
        try {
            if (tpl.file) {
                // Check if it's a file path or a raw JSON object (from "Save as Template" session)
                let json;
                if (typeof tpl.file === 'string') {
                    const res = await fetch(`/data/${tpl.file}`);
                    if (!res.ok) throw new Error('Failed to load template file');
                    json = await res.json();
                } else if (typeof tpl.file === 'object') {
                    json = tpl.file;
                }

                if (json) this.cm.loadTemplate(json);
            } else {
                // Blank
                this.cm.loadTemplate(null);
            }
        } catch (err) {
            console.error('Error loading template:', err);
            NotificationManager.error('Failed to load template');
        }
    }

    saveAsTemplate() {
        const title = prompt('Enter Template Name:', 'My New Template');
        if (!title) return;

        // 1. Get Thumbnail
        const thumb = this.cm.getCanvasDataURL(0.2); // Low res for thumbnail

        // 2. Get JSON
        const json = this.cm.saveProject();

        // 3. Create Template Object
        const newTpl = {
            id: 'tpl_' + Date.now(),
            title: title,
            category: 'Custom',
            thumbnail: thumb,
            file: json, // Store content directly for session
            createdAt: new Date().toISOString()
        };

        // 4. Update List
        this.templates.unshift(newTpl);
        this.render();

        NotificationManager.success('Template saved to list!');

        // 5. Offer Download
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `template_${title.replace(/\s+/g, '_')}.json`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
