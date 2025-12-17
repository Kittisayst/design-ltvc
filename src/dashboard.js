// State
let allTemplates = [];
let activeCategory = 'all';
let searchQuery = '';

async function loadTemplates() {
    try {
        let response = await fetch('data/templates.json');
        if (!response.ok) {
            // Fallback: try pointing to public folder (for raw source deployments)
            response = await fetch('public/data/templates.json');
        }
        if (!response.ok) throw new Error('Failed to load templates');
        const data = await response.json();
        allTemplates = data;
        filterAndRender(); // Initial render
        setupControls();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('template-grid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #ef4444;">
                Failed to load templates. Please try again later.
            </div>
        `;
    }
}

function setupControls() {
    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterAndRender();
        });
    }

    // Tabs
    const tabsContainer = document.getElementById('category-tabs');
    if (tabsContainer) {
        const tabs = tabsContainer.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                activeCategory = tab.dataset.category;
                filterAndRender();
            });
        });
    }
}

function filterAndRender() {
    const filtered = allTemplates.filter(tpl => {
        // Filter by Category
        const matchCat = activeCategory === 'all' ||
            (tpl.category && tpl.category.toLowerCase() === activeCategory.toLowerCase());

        // Filter by Search
        const matchSearch = !searchQuery ||
            tpl.title.toLowerCase().includes(searchQuery);

        return matchCat && matchSearch;
    });

    renderTemplates(filtered);
}

function renderTemplates(templates) {
    const grid = document.getElementById('template-grid');
    grid.innerHTML = '';

    if (templates.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
            No templates found matching your criteria.
        </div>`;
        return;
    }

    templates.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'card';
        // If it's a blank template, link to index.html with no param (or ?new)
        // If it has a file, link to index.html?template=...
        const link = tpl.file ? `canvas.html?template=${encodeURIComponent(tpl.file)}` : 'canvas.html';

        card.onclick = () => {
            window.location.href = link;
        };

        const dateStr = tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString('en-GB') : '';

        card.innerHTML = `
            <img src="${tpl.thumbnail}" alt="${tpl.title}" class="card-img">
            <div class="card-body">
                <div class="card-title">${tpl.title}</div>
                <div class="card-meta">Updated: ${dateStr}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadTemplates);
