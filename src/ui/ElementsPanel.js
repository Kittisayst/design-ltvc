
export class ElementsPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
    }

    init() {
        this.loadElements();
        this.setupBindings();
    }

    setupBindings() {
        // Add Text
        document.getElementById('btn-add-text').addEventListener('click', () => {
            this.cm.addText();
        });

        // Add Image
        document.getElementById('btn-add-image').addEventListener('click', () => {
            this.dom.fileInput.click();
        });

        this.dom.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (f) => this.cm.addImage(f.target.result);
                reader.readAsDataURL(file);
                this.dom.fileInput.value = '';
            }
        });
    }

    async loadElements() {
        try {
            const res = await fetch('/data/elements.json');
            if (!res.ok) throw new Error('Failed to load elements.json');
            const data = await res.json();
            const container = document.getElementById('elements-library-container');
            if (!container) return;

            container.innerHTML = ''; // Clear if re-init

            data.forEach(category => {
                const section = document.createElement('div');
                section.className = 'section';

                const title = document.createElement('div');
                title.className = 'section-title';
                title.textContent = category.category;
                section.appendChild(title);

                const grid = document.createElement('div');
                grid.className = 'row';
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = '1fr 1fr';
                grid.style.gap = '12px';

                category.items.forEach(item => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-element';
                    btn.title = item.label;

                    if (item.icon) {
                        const img = document.createElement('img');
                        img.src = item.icon;
                        img.alt = item.label;
                        img.style.pointerEvents = 'none';
                        btn.appendChild(img);
                    } else {
                        btn.innerHTML = `<span>${item.label}</span>`;
                    }

                    btn.addEventListener('click', () => {
                        if (item.type === 'shape') {
                            this.cm.addShape(item.shapeType, item.options);
                        } else if (item.type === 'image') {
                            this.cm.addImage(item.src);
                        } else if (item.type === 'svg') {
                            this.cm.addSVG(item.src);
                        }
                    });
                    grid.appendChild(btn);
                });

                section.appendChild(grid);
                container.appendChild(section);
            });
        } catch (err) {
            console.error('Failed to load elements library:', err);
        }
    }
}
