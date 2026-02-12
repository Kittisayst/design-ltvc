# ການກວດສອບໂປເຈັກ: Poster Designer Pro

> ວັນທີກວດສອບ: 12/02/2026

---

## 1. ພາບລວມໂປເຈັກ (Project Overview)

**Poster Designer Pro** ແມ່ນແອັບພລິເຄຊັນອອກແບບກຣາຟິກບົນເວັບ (Web-based Vector Design Application) ຄ້າຍຄືກັບ Canva. ພັດທະນາໂດຍໃຊ້ **React 19**, **Vite 7**, ແລະ **Fabric.js 6.9** ເປັນ Canvas Engine ຫຼັກ.

ໂປເຈັກປະກອບມີ 2 ໜ້າຫຼັກ:
- **Dashboard** (`index.html`) — ໜ້າເລືອກ Template ແລະ ສ້າງໂປເຈັກໃໝ່
- **Canvas Editor** (`canvas.html`) — ໜ້າແກ້ໄຂ/ອອກແບບຫຼັກ (React SPA)

---

## 2. ໂຄງສ້າງໂປເຈັກ (Project Structure)

```
design-ltvc/
├── index.html              # Dashboard (Vanilla JS)
├── canvas.html             # Canvas Editor Entry (React SPA)
├── main.js                 # ⚠️ Legacy entry file (ບໍ່ໄດ້ໃຊ້ແລ້ວ)
├── style.css               # CSS ຫຼັກ (34KB, 1821 ແຖວ - ໄຟລ໌ດຽວ)
├── zoom-styles.css         # CSS ສຳລັບ Zoom
├── vite.config.js          # Vite Configuration
├── package.json            # Dependencies
├── temp_thought.txt        # ⚠️ ໄຟລ໌ບັນທຶກຊົ່ວຄາວ (ຄວນລຶບ)
├── poster.md               # ເອກະສານອະທິບາຍລະບົບ (ພາສາລາວ)
├── SYSTEM_OVERVIEW.md      # ເອກະສານເທັກນິກ (ພາສາອັງກິດ)
│
├── src/
│   ├── main.jsx            # React Entry Point
│   ├── App.jsx             # Root Component
│   ├── dashboard.js        # Dashboard Logic (Vanilla JS)
│   │
│   ├── core/               # Business Logic Layer
│   │   ├── CanvasManager.js      # ⭐ ຫົວໃຈຫຼັກ (1040 ແຖວ, 37KB)
│   │   ├── CanvasViewport.js     # Zoom/Pan/Resize
│   │   ├── CanvasEvents.js       # Event Handling
│   │   ├── ClipboardManager.js   # Copy/Paste
│   │   ├── CropControls.js       # Crop Interaction
│   │   ├── GuideManager.js       # Smart Guides/Grid
│   │   ├── LayoutManager.js      # Alignment/Distribution
│   │   ├── NotificationManager.js # Toast Notifications
│   │   ├── managers/
│   │   │   ├── FilterManager.js  # Image Filters
│   │   │   ├── FontManager.js    # Font Loading
│   │   │   ├── HistoryManager.js # Undo/Redo (JSON Patch)
│   │   │   ├── ObjectManager.js  # Layering/Grouping
│   │   │   └── ShapeManager.js   # Shape Factory
│   │   └── services/
│   │       └── GridManager.js    # Grid Rendering
│   │
│   ├── services/            # External/AI Services
│   │   ├── BackgroundRemovalService.js  # AI Background Removal
│   │   ├── ColorService.js              # Color Extraction
│   │   ├── IconService.js               # Iconify API
│   │   ├── StockPhotoService.js         # Unsplash API
│   │   ├── TextExtractionService.js     # OCR (Tesseract)
│   │   ├── UpscalingService.js          # AI Upscaling
│   │   └── VectorizationService.js      # Raster → SVG
│   │
│   ├── components/          # React UI Components
│   │   ├── App Layout: Navbar.jsx, PropertyPanel.jsx
│   │   ├── Panels: ElementsPanel.jsx (⚠️ 907 ແຖວ, 43KB), LayersPanel.jsx, TemplatesPanel.jsx
│   │   ├── Overlays: FloatingToolbar.jsx (350 ແຖວ), ContextMenu.jsx, ColorPicker.jsx
│   │   ├── Modals: ExportModal.jsx, ResizeModal.jsx, ShortcutsModal.jsx, CropModal.jsx
│   │   ├── Canvas: Ruler.jsx, CropToolbar.jsx
│   │   ├── navbar/: ActionButtons, BackgroundControl, UndoRedoControls, ViewOptions, ZoomControls
│   │   └── properties/: ArrangementPanel, ImageEffectsPanel, StylePanel, TextPanel, TransformPanel, DocumentPalette
│   │
│   ├── config/
│   │   └── shapeConfig.js   # Shape Factory Functions
│   │
│   ├── context/
│   │   └── CanvasContext.jsx # React Context (CanvasManager Provider)
│   │
│   └── store/
│       └── useStore.js      # Zustand Global Store
│
└── public/
    ├── data/                # JSON Data Files
    │   ├── elements.json    # Element Library Config
    │   ├── templates.json   # Template Metadata
    │   └── size_templates.json # Page Size Presets
    ├── elements/            # Static Element Assets (SVG/PNG)
    ├── fonts/               # Local Font Files (117 items)
    └── template/            # Template JSON Files
```

---

## 3. ເຕັກໂນໂລຊີ ແລະ ເຄື່ອງມື (Technology Stack & Tools)

### Core Stack
| ເຕັກໂນໂລຊີ | ເວີຊັນ | ໜ້າທີ່ |
|---|---|---|
| **React** | 19.2.3 | UI Framework |
| **Vite** | 7.2.4 | Build Tool & Dev Server |
| **Fabric.js** | 6.9.1 | HTML5 Canvas Engine |
| **Zustand** | 5.0.9 | Global State Management |

### UI Libraries
| Library | ໜ້າທີ່ |
|---|---|
| **lucide-react** | Icon Set |
| **react-colorful** | Color Picker |
| **vanilla-colorful** | Color Picker (Vanilla JS ສຳລັບ canvas.html) |
| **sweetalert2** | Popup Dialogs |
| **sortablejs** | Drag-and-Drop Layers |
| **emoji-picker-react** | Emoji Selection |
| **chart.js + react-chartjs-2** | Chart Generation |

### AI & Processing
| Library | ໜ້າທີ່ |
|---|---|
| **@huggingface/transformers** | AI Background Removal (RMBG-1.4) |
| **@tensorflow/tfjs** | TensorFlow Runtime for Upscaling |
| **upscaler** | AI Image Super-Resolution (2x) |
| **tesseract.js** | OCR Text Extraction (ລາວ + ອັງກິດ) |
| **@mediapipe/tasks-vision** | Vision Tasks (ລວມຢູ່ໃນ deps) |

### Utilities
| Library | ໜ້າທີ່ |
|---|---|
| **jspdf** | Client-side PDF Generation |
| **qrcode** | QR Code Generation (SVG) |
| **jsbarcode** | Barcode Generation |
| **imagetracerjs** | Raster → Vector (SVG) |
| **colorthief** | Color Extraction from Images |
| **fast-json-patch** | Undo/Redo History (Delta Patches) |

### Build & Dev
| ເຄື່ອງມື | ໜ້າທີ່ |
|---|---|
| **Vite** | Dev Server + HMR + Build |
| **@vitejs/plugin-react** | React JSX Transform |
| **npm** | Package Manager |

---

## 4. ສະຖາປັດຕະຍະກຳ (Architecture Analysis)

### ຮູບແບບສະຖາປັດຕະຍະກຳ
- **Hybrid Architecture**: ປະສົມລະຫວ່າງ Vanilla JS (Dashboard) ແລະ React (Canvas Editor)
- **Manager Pattern**: `CanvasManager` ເປັນ God Object ທີ່ຄວບຄຸມທຸກຢ່າງ, ແຕ່ລະ module ແຍກເປັນ Manager ຍ່ອຍ
- **Context + Store**: ໃຊ້ React Context ສຳລັບ CanvasManager instance ແລະ Zustand ສຳລັບ UI state
- **Service Layer**: AI/External services ແຍກເປັນ singleton objects

### State Management
- **Zustand Store** (`useStore.js`): ຈັດການ UI state (tabs, modals, color picker)
- **React Context** (`CanvasContext.jsx`): ສະໜອງ `canvasManager` instance ແລະ `activeObject`
- **CanvasManager Internal State**: Canvas state ຈັດການພາຍໃນ Fabric.js ໂດຍກົງ
- **History**: ໃຊ້ `fast-json-patch` ສຳລັບ delta-based undo/redo (ປະສິດທິພາບດີກ່ວາ full snapshot)

### Data Flow
```
User Interaction → React Component → CanvasManager API → Fabric.js Canvas
                                   → Zustand Store (UI State)
Canvas Events → CanvasContext (activeObject) → React Re-render
```

---

## 5. ຂໍ້ດີ (Strengths / Pros)

### ✅ ສະຖາປັດຕະຍະກຳ
1. **Modular Manager Pattern** — ແຍກ logic ເປັນ managers ຍ່ອຍ (Filter, Font, History, Object, Shape) ຊ່ວຍໃຫ້ code ບໍ່ລວມກັນເກີນ
2. **Delta-based Undo/Redo** — ໃຊ້ `fast-json-patch` ແທນ full snapshot, ປະຢັດ memory ໄດ້ຫຼາຍ
3. **Service Layer ແຍກຈາກ UI** — AI services (Background Removal, OCR, Upscaling) ເປັນ standalone modules ທີ່ reuse ໄດ້
4. **Infinite Canvas Implementation** — ການ implement viewport/pan/zoom ເຮັດໄດ້ດີ, ມີ fix ສຳລັບ `loadFromJSON` resize bug

### ✅ ຄວາມສາມາດ (Features)
5. **AI Features ທີ່ເຮັດວຽກຝັ່ງ Client** — Background Removal, OCR, Upscaling ເຮັດວຽກໃນ browser ໂດຍບໍ່ຕ້ອງ server
6. **ຮອງຮັບພາສາລາວ** — ມີ Lao fonts (Noto Sans Lao, Phetsarath OT) ແລະ OCR ຮອງຮັບພາສາລາວ
7. **Export ຄົບຊຸດ** — PNG, JPG, PDF, JSON project files ພ້ອມ resolution multiplier
8. **Smart Frames** — Drag-and-drop image into shape ສຳລັບ masking ອັດຕະໂນມັດ
9. **ເຄື່ອງມືຫຼາກຫຼາຍ** — QR Code, Barcode, Chart, Icon Library, Stock Photos, Emoji
10. **History ທີ່ດີ** — Delta patches ພ້ອມ sliding window (max 50 steps), ປ້ອງກັນ memory leak

### ✅ ເທັກນິກ
11. **Fabric.js v6 Compatibility** — ແກ້ໄຂ breaking changes ຂອງ v6 ໄດ້ດີ (grouping, ungrouping ດ້ວຍ matrix transformation)
12. **Vite Build** — ໄວ, HMR ດີ, multi-entry (index.html + canvas.html)
13. **Google Fonts Dynamic Loading** — ໂຫຼດ font ຕາມຄວາມຕ້ອງການ, ບໍ່ bloat initial bundle
14. **Professional Export** — Viewport reset ກ່ອນ export ເພື່ອປ້ອງກັນ cropping issues

---

## 6. ຂໍ້ເສຍ ແລະ ບັນຫາ (Weaknesses / Cons)

### ❌ Code Quality Issues

1. **`CanvasManager.js` ເປັນ God Object (1040 ແຖວ, 37KB)**
   - ລວມ logic ຫຼາຍເກີນໄປ: workspace, drawing, crop, export, load/save, vectorize, upscale, OCR, masking, smart frames
   - ຄວນແຍກອອກເປັນ modules ເພີ່ມ (ExportManager, CropManager, etc.)

2. **`ElementsPanel.jsx` ໃຫຍ່ເກີນໄປ (907 ແຖວ, 43KB)**
   - ລວມ QR Code, Barcode, Stock Photos, Icons, Charts, Emoji ໃນ component ດຽວ
   - ຄວນແຍກເປັນ sub-components

3. **Duplicate Code ໃນ `CanvasManager.js`**:
   - `this.filterManager = new FilterManager(this);` ຊ້ຳ 2 ເທື່ອ (ແຖວ 54-55)
   - `bringToFront()` ປະກາດຊ້ຳ 2 ເທື່ອ (ແຖວ 386)
   - `setBackgroundColor()` ປະກາດຊ້ຳ 2 ເທື່ອ (ແຖວ 308 ແລະ 475)
   - Comment ຊ້ຳ "// Native Background Implementation" (ແຖວ 294-295)

4. **Legacy/Dead Code**:
   - `main.js` (root) — ໄຟລ໌ entry ເກົ່າກ່ອນ migrate ໄປ React, ບໍ່ມີໜ້າໃດ reference ແລ້ວ
   - `temp_thought.txt` — ໄຟລ໌ບັນທຶກຊົ່ວຄາວ, ບໍ່ຄວນຢູ່ໃນ repo
   - Comments ແບບ "thinking out loud" ໃນ `CanvasManager.js` (ແຖວ 53-54, 684-729)

5. **Unused Dependencies**:
   - `zundo` — import ຢູ່ໃນ `useStore.js` ແຕ່ `temporal` middleware ບໍ່ໄດ້ຖືກໃຊ້
   - `lit` — ມີໃນ dependencies ແຕ່ເບິ່ງຄືວ່າເປັນ peer dependency ຂອງ `vanilla-colorful` ເທົ່ານັ້ນ

### ❌ Architecture Issues

6. **ສະຖາປັດຕະຍະກຳປະສົມ (Hybrid)**:
   - Dashboard ໃຊ້ **Vanilla JS** (`dashboard.js` + DOM manipulation)
   - Canvas Editor ໃຊ້ **React**
   - ເຮັດໃຫ້ code style ບໍ່ສອດຄ່ອງກັນ, ບໍ່ແບ່ງປັນ components ໄດ້

7. **CSS ເປັນໄຟລ໌ດຽວ (34KB, 1821 ແຖວ)**:
   - `style.css` ລວມ styles ທັງໝົດ (dashboard + editor + components)
   - ບໍ່ໃຊ້ CSS Modules, Tailwind, ຫຼື CSS-in-JS
   - ຍາກຕໍ່ການ maintain ແລະ debug

8. **Props Drilling**:
   - `canvasManager` ຖືກ pass ລົງ Props ຫຼາຍຊັ້ນ (App → Navbar → ActionButtons, App → PropertyPanel → TextPanel)
   - ແມ້ມີ Context ແລ້ວ ແຕ່ບາງ components ຍັງໃຊ້ props ແທນ

9. **Window Global State**:
   - `window.canvasManager = cm` ໃນ `CanvasContext.jsx` — ໃຊ້ global variable ຊຶ່ງເປັນ anti-pattern
   - `window.dispatchEvent(new CustomEvent('historyUpdate'))` — ໃຊ້ custom events ແທນ React state/callback

### ❌ ຄວາມປອດໄພ ແລະ Best Practices

10. **API Key ບໍ່ປອດໄພ**:
    - Unsplash API key ຖືກ baked-in ໃນ code (StockPhotoService.js)
    - ບໍ່ມີ `.env` file ສຳລັບ environment variables

11. **ບໍ່ມີ Error Boundary**:
    - React app ບໍ່ມີ Error Boundary component
    - ຖ້າ component crash ຈະເຮັດໃຫ້ app ທັງໝົດ crash

12. **ບໍ່ມີ TypeScript**:
    - ທຸກໄຟລ໌ເປັນ `.js/.jsx` — ບໍ່ມີ type safety
    - CanvasManager API ມີ methods ຫຼາຍ ແຕ່ບໍ່ມີ type definitions

13. **ບໍ່ມີ Testing**:
    - ບໍ່ມີ unit tests, integration tests, ຫຼື e2e tests
    - ບໍ່ມີ testing framework ໃນ dependencies

14. **ບໍ່ມີ Linting/Formatting**:
    - ບໍ່ມີ ESLint, Prettier, ຫຼື Stylelint config
    - Code style ບໍ່ສະໝ່ຳສະເໝີ

15. **`canvas.html` Path Issue**:
    - `<script type="module" src="/src/main.jsx">` ໃຊ້ absolute path `/src/...`
    - ແຕ່ `vite.config.js` ຕັ້ງ `base: './'` (relative)
    - ອາດເຮັດໃຫ້ deploy ໃນ subdirectory ມີບັນຫາ

---

## 7. ແຜນການປັບປຸງ — ແບ່ງເປັນ Phase

> **ທັງໝົດ 9 Phases** | ລຽງຕາມລຳດັບ dependency ແລະ ຄວາມສ່ຽງ

---

### 📋 PHASE 1: Code Cleanup & Bug Fixes _(1-2 ມື້, ຄວາມສ່ຽງ: ຕ່ຳ)_

**ເປົ້າໝາຍ:** ທຳຄວາມສະອາດ codebase, ແກ້ bugs, ລຶບ dead code

| # | Task | ໄຟລ໌ | ລາຍລະອຽດ |
|---|---|---|---|
| 1.1 | ແກ້ Duplicate Code | `CanvasManager.js` | ລຶບ FilterManager init ຊ້ຳ (ແຖວ 55), bringToFront() ຊ້ຳ (ແຖວ 386), setBackgroundColor() ຊ້ຳ (ແຖວ 308-313), comment ຊ້ຳ (ແຖວ 294-295) |
| 1.2 | ລຶບ Dead Files | root | ລຶບ `main.js` (legacy), `temp_thought.txt` (scratch) |
| 1.3 | ລຶບ Dead Comments | `CanvasManager.js` | ລຶບ "thinking out loud" comments (ແຖວ 684-729), blank lines ເກີນ |
| 1.4 | ແກ້ Path Issue | `canvas.html` | ປ່ຽນ `src="/src/main.jsx"` → `src="./src/main.jsx"` |
| 1.5 | ທຳຄວາມສະອາດ Deps | `package.json` | ລຶບ `zundo` (ບໍ່ໄດ້ໃຊ້), ກວດ `@mediapipe/tasks-vision`, `lit` |
| 1.6 | ປັບ .gitignore | `.gitignore` | ເພີ່ມ `dist/`, `.env` |

**✅ ຜົນລັບ:** Codebase ສະອາດ, ບໍ່ມີ duplicate/dead code

---

### 📋 PHASE 2: ຄວາມປອດໄພ & Dev Tooling _(2-3 ມື້, ຄວາມສ່ຽງ: ຕ່ຳ)_

**ເປົ້າໝາຍ:** Error handling, API key security, code style enforcement

| # | Task | ລາຍລະອຽດ |
|---|---|---|
| 2.1 | Error Boundary | ສ້າງ `ErrorBoundary.jsx`, ຫໍ່ `<App/>` ແລະ AI components ແຍກ |
| 2.2 | Environment Variables | ສ້າງ `.env` + `.env.example`, ແກ້ `StockPhotoService.js` ໃຊ້ `import.meta.env.VITE_UNSPLASH_ACCESS_KEY` |
| 2.3 | ESLint + Prettier | ຕິດຕັ້ງ + config, ເພີ່ມ scripts `lint` ແລະ `format` |
| 2.4 | ລຶບ Window Globals | ລຶບ `window.canvasManager`, ປ່ຽນ `CustomEvent('historyUpdate')` → Zustand store |

**✅ ຜົນລັບ:** App ບໍ່ crash ເມື່ອ error, API keys ປອດໄພ, code style ສອດຄ່ອງ

---

### 📋 PHASE 3: Refactor Core Architecture _(5-7 ມື້, ຄວາມສ່ຽງ: ກາງ)_

**ເປົ້າໝາຍ:** ແຍກ God Object, ຫຼຸດ component size, ປັບ state management

#### 3.1 ແຍກ `CanvasManager.js` (1040 ແຖວ → ~400 ແຖວ)
| Manager ໃໝ່ | ຍ້າຍ Methods | ແຖວ |
|---|---|---|
| `ExportManager.js` | exportImage(), exportProject(), saveProject() | 752-986 |
| `CropManager.js` | startCropMode(), applyCrop(), cancelCrop() | 824-901 |
| `SmartFrameManager.js` | initSmartFrames(), clipImageToShape() | 68-211 |
| `DrawingManager.js` | enableDrawingMode(), disableDrawingMode(), setBrush*() | 240-270 |
| `AIManager.js` | vectorize*, upscale*, extractPalette*, extractText* | 538-1034 |

#### 3.2 ແຍກ `ElementsPanel.jsx` (907 ແຖວ → ~150 ແຖວ)
| Sub-component ໃໝ່ | ເນື້ອຫາ |
|---|---|
| `elements/ShapeGrid.jsx` | Shape/SVG grid, category nav, search |
| `elements/StockPhotosPanel.jsx` | Unsplash search, API key, photo grid |
| `elements/QRCodePanel.jsx` | QR code form + generation |
| `elements/BarcodePanel.jsx` | Barcode form + format + generation |
| `elements/IconSearchPanel.jsx` | Iconify search + icon grid |
| `elements/EmojiPanel.jsx` | Emoji picker wrapper |
| `elements/ChartPanel.jsx` | Chart type, data input, preview |

#### 3.3 ຫຼຸດ Props Drilling
- ປ່ຽນ components ໃຫ້ໃຊ້ `useCanvas()` hook ໂດຍກົງ ແທນ `canvasManager` prop
- ຍ້າຍ `activeObject`, history state ເຂົ້າ Zustand store

**✅ ຜົນລັບ:** CanvasManager ນ້ອຍລົງ 60%, ElementsPanel ນ້ອຍລົງ 80%

---

### 📋 PHASE 4: CSS & UI Architecture _(3-5 ມື້, ຄວາມສ່ຽງ: ກາງ)_

**ເປົ້າໝາຍ:** ແຍກ CSS, ປັບປຸງ UX, theme support

| # | Task | ລາຍລະອຽດ |
|---|---|---|
| 4.1 | ແຍກ CSS | ແຍກ `style.css` (1821 ແຖວ) → `src/styles/` folder: variables, base, layout, dashboard, canvas, panels, modals, toolbar, components |
| 4.2 | AI Loading States | ສ້າງ `ProgressOverlay.jsx` — progress bar ສຳລັບ BG Removal, OCR, Upscaling |
| 4.3 | Tooltips | ສ້າງ `Tooltip.jsx` ສຳລັບ navbar/toolbar buttons |
| 4.4 | Dark/Light Theme | ແຍກ color variables ເປັນ 2 sets, ເພີ່ມ toggle, ບັນທຶກ localStorage |

**✅ ຜົນລັບ:** CSS modular, AI ມີ progress bar, light/dark theme

---

### 📋 PHASE 5: Dashboard Migration & SPA Routing _(3-4 ມື້, ຄວາມສ່ຽງ: ກາງ)_

**ເປົ້າໝາຍ:** ລວມ Dashboard ເຂົ້າ React SPA

| # | Task | ລາຍລະອຽດ |
|---|---|---|
| 5.1 | ຕິດຕັ້ງ Router | `react-router-dom`, routes: `/` (Dashboard), `/editor` (Canvas) |
| 5.2 | Dashboard → React | ສ້າງ `pages/Dashboard.jsx`, `dashboard/TemplateCard.jsx`, `dashboard/CategoryTabs.jsx` |
| 5.3 | ລວມ Entry Points | ລຶບ multi-entry, rename `canvas.html` → `index.html`, ລຶບ `dashboard.js` |
| 5.4 | Lazy Loading | `React.lazy()` ສຳລັບ Editor page (heavy), Dashboard ໂຫຼດໄວ |

**✅ ຜົນລັບ:** SPA ດຽວ, Dashboard ເປັນ React, ແບ່ງປັນ components ໄດ້

---

### 📋 PHASE 6: Performance Optimization _(3-4 ມື້, ຄວາມສ່ຽງ: ຕ່ຳ-ກາງ)_

**ເປົ້າໝາຍ:** ຫຼຸດ bundle size, ປັບປຸງ rendering speed

| # | Task | ລາຍລະອຽດ |
|---|---|---|
| 6.1 | Code Splitting | Dynamic import AI services (BG Removal, Upscaling, OCR), lazy load ChartPanel, EmojiPanel |
| 6.2 | React Perf | `React.memo()` ສຳລັບ LayersPanel, PropertyPanel, Ruler. `useMemo/useCallback` ສຳລັບ expensive ops |
| 6.3 | Canvas Perf | `objectCaching: true`, throttle `object:moving`, `requestAnimationFrame` ສຳລັບ guides |
| 6.4 | Asset Optimization | Compress fonts (subset), PNGs → WebP, lazy load thumbnails |

**✅ ຜົນລັບ:** Bundle ນ້ອຍລົງ, render ໄວຂຶ້ນ, AI ໂຫຼດ on-demand

---

### 📋 PHASE 7: Testing & TypeScript _(7-10 ມື້, ຄວາມສ່ຽງ: ຕ່ຳ)_

**ເປົ້າໝາຍ:** Type safety ແລະ automated testing (incremental)

| # | Task | ລາຍລະອຽດ |
|---|---|---|
| 7.1 | ຕິດຕັ້ງ TS | `typescript`, `@types/react`, `tsconfig.json` (strict: false) |
| 7.2 | Migrate Core → TS | NotificationManager, HistoryManager, FilterManager, FontManager, ObjectManager, ShapeManager |
| 7.3 | Migrate Services → TS | ທຸກ 7 services ໃນ `src/services/` |
| 7.4 | Unit Tests | `vitest` + `@testing-library/react` — tests ສຳລັບ HistoryManager, FilterManager, LayoutManager, useStore |
| 7.5 | E2E Tests | Playwright — Dashboard→Editor, add shape, add text, export, save/load |

**✅ ຜົນລັບ:** Type safety ສຳລັບ core, unit + E2E tests ສຳລັບ critical paths

---

### 📋 PHASE 8: New Editor Features _(7-14 ມື້, ຄວາມສ່ຽງ: ກາງ)_

**ເປົ້າໝາຍ:** ເພີ່ມ features ໃໝ່ລະດັບ professional

| # | Feature | ລາຍລະອຽດ |
|---|---|---|
| 8.1 | Gradient Editor ຂັ້ນສູງ | Linear + Radial, ຫຼາຍ color stops, real-time preview |
| 8.2 | Pen Tool | Fabric.js Path API, click anchor + drag curves + double-click finish |
| 8.3 | Text on Path | ໃຊ້ Fabric.js textPath, options: arc, wave, circle |
| 8.4 | Multi-page | PageManager.js, PageNavigator.jsx (thumbnail strip), multi-page PDF export |
| 8.5 | Image Effects ເພີ່ມ | Drop Shadow, Blend Modes, Border/Frame, Rounded corners |

**✅ ຜົນລັບ:** Editor ມີ features ລະດັບ professional ເພີ່ມ

---

### 📋 PHASE 9: Infrastructure & Backend _(14-21 ມື້, ຄວາມສ່ຽງ: ສູງ)_

**ເປົ້າໝາຍ:** Backend, cloud save, auth, PWA

| # | Feature | ລາຍລະອຽດ |
|---|---|---|
| 9.1 | Backend API | Node.js+Express ຫຼື Supabase — REST API ສຳລັບ projects CRUD |
| 9.2 | Authentication | Login/Register, JWT ຫຼື Supabase Auth, guest mode |
| 9.3 | Cloud Save | Auto-save (30s debounce), project list, thumbnail upload, S3/Supabase Storage |
| 9.4 | PWA | manifest.json, Service Worker (vite-plugin-pwa), offline caching |
| 9.5 | CDN Assets | ຍ້າຍ fonts + elements ໄປ CDN, ຫຼຸດ repo size |
| 9.6 | i18n | ຮອງຮັບ ລາວ/ອັງກິດ/ໄທ ໃນ UI ດ້ວຍ react-i18next |

**✅ ຜົນລັບ:** Full-stack app ພ້ອມ cloud save, auth, offline support

---

## 8. ສະຫຼຸບ Timeline

| Phase | ໄລຍະເວລາ | ຄວາມສ່ຽງ | ຜົນລັບຫຼັກ |
|---|---|---|---|
| **Phase 1** Code Cleanup | 1-2 ມື້ | 🟢 ຕ່ຳ | Codebase ສະອາດ |
| **Phase 2** Security & Tooling | 2-3 ມື້ | 🟢 ຕ່ຳ | Error handling, API security, linting |
| **Phase 3** Core Refactor | 5-7 ມື້ | 🟡 ກາງ | God Object ແຍກ, components ນ້ອຍລົງ |
| **Phase 4** CSS & UI | 3-5 ມື້ | 🟡 ກາງ | CSS modular, theme, progress bars |
| **Phase 5** SPA Migration | 3-4 ມື້ | 🟡 ກາງ | Single React SPA |
| **Phase 6** Performance | 3-4 ມື້ | 🟢 ຕ່ຳ | Bundle ນ້ອຍ, render ໄວ |
| **Phase 7** TS & Testing | 7-10 ມື້ | 🟢 ຕ່ຳ | Type safety, automated tests |
| **Phase 8** New Features | 7-14 ມື້ | 🟡 ກາງ | Pen tool, multi-page, effects |
| **Phase 9** Backend | 14-21 ມື້ | 🔴 ສູງ | Cloud save, auth, PWA |
| **ລວມ** | **~45-70 ມື້** | | **Production-ready app** |

> **ໝາຍເຫດ:** Phase 1-2 ສາມາດເລີ່ມໄດ້ທັນທີ. Phase 3-6 ເຮັດຕາມລຳດັບ. Phase 7 ເຮັດຄ່ອຍໆຄຽງຄູ່ phases ອື່ນ. Phase 8-9 ເຮັດຫຼັງ refactor ສຳເລັດ.