
import { HexColorPicker } from 'vanilla-colorful';

export class AdvancedColorPicker {
    constructor(options = {}) {
        this.onChange = options.onChange || (() => { });
        this.color = options.color || '#000000';
        this.presets = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff',
            '#ffffff', '#000000', '#808080', '#c0c0c0', '#ffa500', '#800080',
            '#008000', '#000080', '#800000', '#008080'
        ];

        // Gradient presets (CSS strings)
        this.gradientPresets = [
            'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
            'linear-gradient(90deg, #ffff00 0%, #ff0000 100%)',
            'linear-gradient(45deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
            'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(to top, #30cfd0 0%, #330867 100%)'
        ];

        this.activeTab = 'solid'; // 'solid' or 'gradient'
        this.element = null;
        this.picker = null;
    }

    mount(container) {
        this.element = document.createElement('div');
        this.element.className = 'advanced-color-picker';

        this.render();
        container.appendChild(this.element);
    }

    render() {
        if (!this.element) return;
        this.element.innerHTML = '';

        // Header: Tabs
        const tabs = document.createElement('div');
        tabs.className = 'acp-tabs';
        tabs.innerHTML = `
            <div class="acp-tab ${this.activeTab === 'solid' ? 'active' : ''}" data-tab="solid">Solid Color</div>
            <div class="acp-tab ${this.activeTab === 'gradient' ? 'active' : ''}" data-tab="gradient">Gradient</div>
            <div class="acp-indicator"></div>
        `;
        this.element.appendChild(tabs);

        // Bind Tabs
        tabs.querySelectorAll('.acp-tab').forEach(t => {
            t.addEventListener('click', () => {
                this.activeTab = t.dataset.tab;
                this.render(); // Re-render content
            });
        });

        // Content Area
        const content = document.createElement('div');
        content.className = 'acp-content';

        if (this.activeTab === 'solid') {
            this.renderSolidTab(content);
        } else {
            this.renderGradientTab(content);
        }

        this.element.appendChild(content);

        // Initialize Picker if in solid mode
        if (this.activeTab === 'solid') {
            const pickerEl = this.element.querySelector('#acp-picker-mount');
            if (pickerEl) {
                this.picker = new HexColorPicker();
                pickerEl.appendChild(this.picker);
                this.picker.color = this.color;
                this.picker.addEventListener('color-changed', (e) => {
                    this.handleColorChange(e.detail.value);
                });
            }
        }
    }

    renderSolidTab(container) {
        // Swatches
        const swatchesDiv = document.createElement('div');
        swatchesDiv.className = 'acp-swatches';

        // Add "None" / Transparent option?
        const noColor = document.createElement('div');
        noColor.className = 'acp-swatch acp-no-color';
        noColor.title = 'Transparent';
        noColor.innerHTML = '<div class="slash"></div>';
        noColor.addEventListener('click', () => this.handleColorChange('transparent'));
        swatchesDiv.appendChild(noColor);

        this.presets.forEach(c => {
            const s = document.createElement('div');
            s.className = 'acp-swatch';
            s.style.backgroundColor = c;
            s.addEventListener('click', () => {
                this.handleColorChange(c);
                if (this.picker) this.picker.color = c;
            });
            swatchesDiv.appendChild(s);
        });

        container.appendChild(swatchesDiv);

        // Picker Container
        const pickerMount = document.createElement('div');
        pickerMount.id = 'acp-picker-mount';
        container.appendChild(pickerMount);

        // Hex Input
        const inputRow = document.createElement('div');
        inputRow.className = 'acp-input-row';
        inputRow.innerHTML = `
             <div class="acp-preview" style="background-color: ${this.color}"></div>
             <input type="text" class="acp-hex-input" value="${this.color}" spellcheck="false">
        `;
        container.appendChild(inputRow);

        // Bind Input
        const input = inputRow.querySelector('input');
        input.addEventListener('change', (e) => {
            let val = e.target.value;
            if (val.startsWith('#') && (val.length === 7 || val.length === 4)) {
                this.handleColorChange(val);
                if (this.picker) this.picker.color = val;
            }
        });
    }

    renderGradientTab(container) {
        const grid = document.createElement('div');
        grid.className = 'acp-gradient-grid';

        this.gradientPresets.forEach(g => {
            const btn = document.createElement('div');
            btn.className = 'acp-gradient-btn';
            btn.style.background = g;
            btn.addEventListener('click', () => {
                // Fabric JS Gradient Logic is complex.
                // For now, we rely on the PropertyPanel to handle strict parsing,
                // OR we can pass a special structure?
                // Actually Fabric supports CSS gradient strings in set('fill', ...) mostly?
                // No, Fabric needs setGradient() or specific object structure.
                // BUT, newer Fabric versions might parse.
                // Let's pass the raw string and let CanvasManager handle it? 
                // Or we can parse it here.
                // Simple Approach: Pass string, CanvasManager detects 'linear-gradient' and converts.
                this.handleColorChange(g);
            });
            grid.appendChild(btn);
        });

        container.appendChild(grid);
    }

    handleColorChange(value) {
        this.color = value;
        // Update local UI
        const input = this.element.querySelector('.acp-hex-input');
        const preview = this.element.querySelector('.acp-preview');

        if (input && document.activeElement !== input) input.value = value;
        if (preview) preview.style.backgroundColor = value;

        this.onChange(value);
    }
}
