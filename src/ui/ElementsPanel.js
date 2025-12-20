import { createIcons, icons } from 'lucide';

export class ElementsPanel {
    constructor(dom, canvasManager) {
        this.dom = dom;
        this.cm = canvasManager;
        this.BATCH_SIZE = 20;
        this.state = {
            shapes: {
                allItems: [],
                filteredItems: [],
                page: 0,
                hasMore: true
            },
            icons: {
                allNames: [],
                filteredNames: [],
                page: 0,
                hasMore: true
            },
            photos: {
                page: 1,
                isLoading: false,
                hasMore: true,
                query: ''
            }
        };
    }

    init() {
        this.renderStructure();
        this.bindEvents();
        this.switchTab('shapes');
    }

    renderStructure() {
        // Elements Panel Container
        const container = document.getElementById('elements-library-container');
        if (!container) return;

        container.innerHTML = `
            <div class="elements-tabs">
                <button class="el-tab active" data-tab="shapes">Shapes</button>
                <button class="el-tab" data-tab="icons">Icons</button>
                <button class="el-tab" data-tab="photos">Photos</button>
            </div>
            
            <div class="elements-search-box">
                <i data-lucide="search" class="search-icon-sm"></i>
                <input type="text" placeholder="Search..." id="el-search-input">
            </div>

            <div id="el-content-shapes" class="el-content-area" style="height: calc(100vh - 220px); overflow-y: auto;">
                <div class="elements-grid-flat"></div>
                <div class="loading-trigger" style="height: 20px;"></div>
            </div>
            <div id="el-content-icons" class="el-content-area" style="display:none; height: calc(100vh - 220px); overflow-y: auto;">
                <div class="elements-grid-flat"></div>
                <div class="loading-trigger" style="height: 20px;"></div>
            </div>
            <div id="el-content-photos" class="el-content-area" style="display:none; height: calc(100vh - 220px); overflow-y: auto;">
                <div class="elements-grid-masonry"></div>
                <div class="loading-trigger" style="height: 20px;"></div>
            </div>
        `;

        this.tabBtns = container.querySelectorAll('.el-tab');
        this.searchInput = container.querySelector('#el-search-input');

        this.containers = {
            shapes: container.querySelector('#el-content-shapes'),
            icons: container.querySelector('#el-content-icons'),
            photos: container.querySelector('#el-content-photos'),
        };

        // Scroll Listeners for Infinite Load
        Object.keys(this.containers).forEach(key => {
            const c = this.containers[key];
            c.addEventListener('scroll', () => {
                if (c.scrollTop + c.clientHeight >= c.scrollHeight - 50) {
                    this.loadMore(key);
                }
            });
        });

        this.loadShapesData(); // Initial Data Load
    }

    bindEvents() {
        // Tab Switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.handleSearch(query);
        });

        // Add Local Image/Text buttons (Sidebar specific, might be outside this panel logic but kept for compat)
        // Check if existing buttons still exist in DOM outside container?
        // In previous code, bindEvents bound #btn-add-text and #btn-add-image which are in sidebar.html, not inside elements-library-container.

        const btnAddText = document.getElementById('btn-add-text');
        if (btnAddText) btnAddText.addEventListener('click', () => this.cm.addText());

        const btnAddImage = document.getElementById('btn-add-image');
        if (btnAddImage) {
            btnAddImage.addEventListener('click', () => this.dom.fileInput.click());
        }

        if (this.dom.fileInput) {
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
    }

    switchTab(tabName) {
        // UI Toggle
        this.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Content Toggle
        Object.keys(this.containers).forEach(key => {
            this.containers[key].style.display = key === tabName ? 'block' : 'none';
        });

        this.currentTab = tabName;

        // Lazy Init Tabs
        if (tabName === 'icons' && this.state.icons.allNames.length === 0) this.loadIconsData();
        if (tabName === 'photos' && this.state.photos.page === 1 && !this.state.photos.loaded) {
            this.state.photos.loaded = true;
            this.loadMorePhotos();
        }

        // Re-apply search if exists
        const currentQuery = this.searchInput.value.toLowerCase();
        if (currentQuery) this.handleSearch(currentQuery);
    }

    loadMore(type) {
        if (type === 'shapes') this.renderShapesBatch();
        if (type === 'icons') this.renderIconsBatch();
        if (type === 'photos') this.loadMorePhotos();
    }

    handleSearch(query) {
        if (this.currentTab === 'shapes') {
            this.state.shapes.filteredItems = this.state.shapes.allItems.filter(i =>
                i.label.toLowerCase().includes(query)
            );
            this.state.shapes.page = 0;
            this.state.shapes.hasMore = true;
            this.containers.shapes.querySelector('.elements-grid-flat').innerHTML = '';
            this.renderShapesBatch();
        }

        if (this.currentTab === 'icons') {
            this.state.icons.filteredNames = this.state.icons.allNames.filter(name =>
                name.toLowerCase().includes(query)
            );
            this.state.icons.page = 0;
            this.state.icons.hasMore = true;
            this.containers.icons.querySelector('.elements-grid-flat').innerHTML = '';
            this.renderIconsBatch();
        }

        if (this.currentTab === 'photos') {
            clearTimeout(this.photoDebounce);
            this.photoDebounce = setTimeout(() => {
                this.state.photos.query = query;
                this.state.photos.page = 1;
                this.state.photos.hasMore = true;
                this.containers.photos.querySelector('.elements-grid-masonry').innerHTML = '';
                this.loadMorePhotos();
            }, 500);
        }
    }

    // --- SHAPES ---
    async loadShapesData() {
        try {
            const res = await fetch('/data/elements.json');
            const data = await res.json();

            const items = [];
            data.forEach(cat => cat.items.forEach(item => items.push(item)));

            this.state.shapes.allItems = items;
            this.state.shapes.filteredItems = items;

            this.renderShapesBatch();
        } catch (e) {
            console.error(e);
        }
    }

    renderShapesBatch() {
        const { filteredItems, page, hasMore } = this.state.shapes;
        if (!hasMore) return;

        const start = page * this.BATCH_SIZE;
        const end = start + this.BATCH_SIZE;
        const batch = filteredItems.slice(start, end);

        if (batch.length === 0) {
            this.state.shapes.hasMore = false;
            return;
        }

        const grid = this.containers.shapes.querySelector('.elements-grid-flat');

        batch.forEach(item => {
            // Show shape, svg, and image types
            if (!['shape', 'svg', 'image'].includes(item.type)) return;

            const btn = document.createElement('button');
            btn.className = 'btn btn-element-flat';
            btn.title = item.label;

            if (item.icon) {
                const img = document.createElement('img');
                img.src = item.icon;
                btn.appendChild(img);
            } else {
                btn.textContent = item.label;
            }

            btn.addEventListener('click', () => {
                if (item.type === 'shape') this.cm.addShape(item.shapeType, item.options);
                if (item.type === 'svg') this.cm.addSVG(item.src, item.options);
                if (item.type === 'image') this.cm.addImage(item.src, item.options);
            });
            grid.appendChild(btn);
        });

        this.state.shapes.page++;
        if (end >= filteredItems.length) this.state.shapes.hasMore = false;
    }

    // --- ICONS (Lucide) ---
    loadIconsData() {
        this.state.icons.allNames = Object.keys(icons); // ['Heart', 'ArrowRight', ...]
        this.state.icons.filteredNames = this.state.icons.allNames;
        this.renderIconsBatch();
    }

    renderIconsBatch() {
        const { filteredNames, page, hasMore } = this.state.icons;
        if (!hasMore) return;

        const start = page * this.BATCH_SIZE;
        const end = start + this.BATCH_SIZE;
        const batch = filteredNames.slice(start, end);

        if (batch.length === 0) {
            this.state.icons.hasMore = false;
            return;
        }

        const grid = this.containers.icons.querySelector('.elements-grid-flat');

        // Helper to convert PascalCase to kebab-case for Lucide data-lucide attribute
        const toKebab = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

        batch.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-element-flat icon-btn-large';
            btn.title = name;

            // Render Icon
            const i = document.createElement('i');
            i.setAttribute('data-lucide', toKebab(name)); // Fix: Convert to kebab-case
            btn.appendChild(i);

            btn.addEventListener('click', () => this.addIconToCanvas(name)); // Pass original name
            grid.appendChild(btn);
        });

        createIcons({ icons, nameAttr: 'data-lucide', attrs: { width: 24, height: 24 } });

        this.state.icons.page++;
        if (end >= filteredNames.length) this.state.icons.hasMore = false;
    }

    addIconToCanvas(name) {
        // Construct SVG String from Lucide definition
        // icons[name] = [tag, attrs, children] ?? 
        // Actually, lucide export is: { Heart: [...] } 
        // Format: [ "tag", { ...attrs }, [ [ "childTag", { ...childAttrs } ], ... ] ]
        // Wait, Lucide exports are cleaner in newer versions. 
        // Let's assume standard usage: `createIcons` builds it.
        // We can just fetch the SVG from the DOM node we created?
        // Yes, create a temp node.

        // Helper to convert PascalCase to kebab-case
        const toKebab = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

        const temp = document.createElement('div');
        temp.innerHTML = `<i data-lucide="${toKebab(name)}"></i>`; // Fix: Convert to kebab-case
        createIcons({ icons, nameAttr: 'data-lucide', root: temp });
        const svg = temp.querySelector('svg');
        if (svg) {
            // Modify SVG attributes for Fabric (remove width/height to allow scaling preference?)
            // Or keep them.
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            this.cm.addSVGString(svg.outerHTML, { fill: '#333333' });
        }
    }

    // --- PHOTOS (Lorem Picsum / Unsplash) ---
    async loadMorePhotos() {
        const s = this.state.photos;
        if (s.isLoading || !s.hasMore) return;

        s.isLoading = true;
        const grid = this.containers.photos.querySelector('.elements-grid-masonry');
        const spinner = this.containers.photos.querySelector('.loading-trigger');
        spinner.textContent = 'Loading...';

        try {
            // Simulated API with Pagination
            let items = [];
            // Use Picsum v2 list for "All", Seed for "Search"
            if (!s.query) {
                // Default: Picsum List (Fast, good quality)
                const res = await fetch(`https://picsum.photos/v2/list?page=${s.page}&limit=${this.BATCH_SIZE}`);
                const data = await res.json();
                items = data.map(i => ({
                    thumb: `https://picsum.photos/id/${i.id}/200/200`,
                    full: `https://picsum.photos/id/${i.id}/800/600`
                }));
                if (data.length < this.BATCH_SIZE) s.hasMore = false;
            } else {
                // Search: Use LoremFlickr for keyword relevance (Picsum doesn't support keywords)
                if (s.page > 5) s.hasMore = false;
                else {
                    items = Array.from({ length: this.BATCH_SIZE }).map((_, i) => {
                        const lock = s.page * 100 + i; // Unique ID for stability
                        return {
                            thumb: `https://loremflickr.com/200/200/${s.query}?lock=${lock}`,
                            full: `https://loremflickr.com/800/600/${s.query}?lock=${lock}`
                        };
                    });
                }
            }

            items.forEach(item => {
                const img = document.createElement('img');
                img.src = item.thumb;
                img.className = 'photo-item';
                img.loading = 'lazy';
                img.addEventListener('click', () => {
                    this.cm.addImage(item.full);
                });
                grid.appendChild(img);
            });

            s.page++;
        } catch (e) {
            console.error(e);
            s.hasMore = false;
        } finally {
            s.isLoading = false;
            spinner.textContent = '';
        }
    }
}
