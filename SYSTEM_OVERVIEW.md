# System Overview: Poster Designer Pro

## 1. Project Architecture

The project is a web-based vector design application built with **React**, **Vite**, and **Fabric.js**. It follows a modular architecture separating core canvas logic (Fabric.js wrapper) from the UI layer (React components).

### Directory Structure

- **`src/core/`**: Contains the business logic for the canvas.
  - `CanvasManager.js`: The central controller. Wraps the Fabric.js canvas instance and exposes API for the UI.
  - `CanvasViewport.js`: Handles zooming, panning, and responsive workspace resizing (Infinite Canvas).
  - `CanvasEvents.js`: Manages event listeners (selection, transformation, mouse interaction).
  - `ClipboardManager.js`: Handles copy/paste operations.
  - `CropControls.js`: Custom controls logic for image cropping interactions.
  - `GuideManager.js`: Manages smart guides, grid, and snapping.
  - `LayoutManager.js`: alignment and distribution logic.
  - `NotificationManager.js`: Toast notification system.
  - **`managers/`**:
    - `FilterManager.js`: Image filter application logic.
    - `FontManager.js`: Text styling and font loading.
    - `HistoryManager.js`: Undo/Redo history stack management.
    - `ObjectManager.js`: Object z-index layering, grouping, and locking.
    - `ShapeManager.js`: Factory for creating shapes and adding assets.
  - **`services/`**:
    - `GridManager.js`: Grid rendering service.

- **`src/services/`**:
  - `BackgroundRemovalService.js`: Service for removing image backgrounds (Transformers.js).
  - `ColorService.js`: Color extraction and palette generation (ColorThief).
  - `UpscalingService.js`: AI image upscaling (UpscalerJS).
  - `VectorizationService.js`: Raster to SVG vector conversion (ImageTracerJS).
  - `VectorizationService.js`: Raster to SVG vector conversion (ImageTracerJS).
  - `TextExtractionService.js`: OCR Text Extraction (Tesseract.js).
  - `StockPhotoService.js`: Unsplash API integration for stock photos.

- **`src/components/`**: React components managing the UI.
  - **`navbar/`**: Top navigation bar components.
    - `ActionButtons.jsx`: Export, Save, Open actions.
    - `BackgroundControl.jsx`: Canvas background color picker.
    - `UndoRedoControls.jsx`: Undo/Redo history buttons.
    - `ViewOptions.jsx`: Rulers and Grid toggles.
    - `ZoomControls.jsx`: Zoom level, handheld tool, and fit-to-screen controls.
  - `Navbar.jsx`: Main Navbar container.
  - `LayersPanel.jsx`: Manages the layer stack (ordering, visibility, locking, multi-selection).
  - `ElementsPanel.jsx`: "Elements" sidebar (Shapes, Vector Graphics, Images) with scrollable categories.
  - `PropertyPanel.jsx`: Context-sensitive properties panel (updates based on selected object).
    - **`properties/`**: `ArrangementPanel.jsx`, `ImageEffectsPanel.jsx`, `StylePanel.jsx`, `TextPanel.jsx`, `TransformPanel.jsx`.
  - `TemplatesPanel.jsx`: Handles loading predefined templates.
  - `ContextMenu.jsx`: Right-click interaction menu.
  - `FloatingToolbar.jsx`: On-canvas toolbar for quick actions near selection.
  - `HistoryPanel.jsx`: Visual undo/redo history list.
  - `ColorPicker.jsx`: Custom floating color picker component.
  - `Ruler.jsx`: Canvas ruler overlays.
  - **`canvas/`**:
    - `CropToolbar.jsx`: Floating toolbar for cropping actions.
  - **Modals**: `CropModal.jsx`, `ExportModal.jsx`, `ResizeModal.jsx`, `ShortcutsModal.jsx`.

- **`src/config/`**: Configuration files.
  - `shapeConfig.js`: Factory functions for complex shapes (Star, Heart, Arrow, etc.).

- **`src/context/`**:
  - `CanvasContext.jsx`: React Context for sharing `CanvasManager` and active state.

- **`src/store/`**:
  - `useStore.js`: Global Zustand store for UI state.



- **`public/`**: Static assets.
  - `data/elements.json`: Configuration for the Element Library items.
  - `data/templates.json`: Metadata for available templates.

## 2. Core Capabilities

### Canvas & Workspace
- **Infinite Canvas**: The physical canvas fills the window; the "Logical Page" (workspace) is a centered area (e.g., A4) within it.
- **Viewport Controls**: Zoom (10% to 500%), Pan (Hand Tool/Spacebar), and "Fit to Screen" logic.
- **Background**: Customizable solid colors and **linear gradients** (Vertical, Horizontal, Diagonal) via Navbar control.

### Object Support
- **Shapes**:
  - Basic: Rectangle, Circle, Triangle.
  - Advanced: Star, Pentagon, Hexagon, Arrow, Heart, Message Box (SVG-based).
  - Features: Supports stroke uniform scaling, custom stroke widths, and shadows.
- **Text**:
  - Rich text editing (IText) with on-canvas font selector.
  - Fonts: Google Fonts and local Lao fonts.
  - Styling: Bold, Italic, Underline, Color, Spacing, Alignment.
- **Images**:
  - **AI Background Removal**: Fully client-side removal using `@huggingface/transformers` (RMBG-1.4).
  - **Cropping**: On-canvas interaction with custom corner handles and non-destructive preview.
  - **Masking**: "Image-in-Shape" masking support (ClipPath) via the right-click context menu.
  - **Filters**: 11 professional filters (Brightness, Contrast, Blur, Saturation, Sharpen, Grayscale, Sepia, Hue, Noise, Pixelate, Tint).
  - **Upscaling**: 2x AI Super-Resolution using `upscaler` (TensorFlow.js).
  - **Vectorization**: Raster-to-Vector conversion (SVG) using `imagetracerjs`.
  - **Color Extraction**: Dominant color and palette generation via `colorthief`.
  - **Text Extraction**: OCR (Optical Character Recognition) supporting Lao/English via `tesseract.js`.
- **SVG**:
  - Vector graphics imported as editable groups.
  - Features recursive property application for fill and stroke.

### Workflow Enhancements
- **Floating Toolbar**: Context-aware tools (Font Family, Bold/Italic, Color, Layers) appear near the active selection.
- **Elements Library**: Categorized, searchable library of assets with horizontal category navigation.
- **Stock Photos**: Integrated Unsplash image search and import with API key management.
- **QR Code Generator**: Create vector-based (SVG) QR codes directly on the canvas.
- **Barcode Generator**: Generate product barcodes (CODE128, EAN, UPC) as vector objects.
- **Icon Library**: Integrated Iconify search for access to thousands of vector icons.
- **Emoji Picker**: Integrated rich emoji library for adding expressive text elements.
- **Chart Generator**: Create and import data visualizations (Bar, Line, Pie, Doughnut).
- **Smart Guides & Snapping**: 
  - Dynamic alignment guides when moving objects.
  - Snapping to other objects' edges/centers and workspace center.
  - **Grid System**: Toggleable visual grid with snapping support.
- **Layers**: Drag-and-drop reordering, locking, visibility toggles, and multi-selection support.
- **Context Menu**: Quick access to professional actions (Copy/Paste, Mirror, Group, Align, Mask).
- **Clipboard Integration**:
  - **Internal**: Copy/Paste complex objects within the app.
  - **System**: Supports **Ctrl+V** to paste text from external applications directly onto the canvas.

### Text Effects
- **Professional Styles**: One-click presets for **Neon Glow**, **Lift** (Soft Shadow), **Drop Shadow**, **Outline**, and **Hollow** text.
- **Customization**: Fine-grained control over shadow blur, offset, and color, as well as stroke width and color.

### Export
- **PNG/JPG**: High-quality raster export (support for 2x, 4x scaling multiplier).
- **PDF**: Client-side PDF generation matching workspace dimensions.
- **JSON (Project File)**: 
  - Full project state persistence.
  - **Embedded Thumbnails**: Integrated low-res preview for quick loading/browsing.
  - **URL Sanitization**: Automatic conversion of absolute asset URLs to relative paths for project portability across different domains.

## 3. Key Features Status

- [x] **React Migration**: UI fully migrated to React components.
- [x] **Infinite Canvas**: Implemented with `CanvasViewport`.
- [x] **Advanced Text**: Custom fonts and rich formatting supported.
- [x] **Cropping**: Image masking and crop interaction.
- [x] **Background Color**: Dedicated picker in Navbar.
- [x] **Element Library**: Horizontal scrollable categories with simplified labels.

## 4. Technical Implementation Notes

### Grouping & Ungrouping (Fabric.js v6)
Due to breaking changes in Fabric.js v6 (removal of `toActiveSelection` and `removeWithUpdate`), a custom implementation was developed to ensure stability:

1.  **Rigid Grouping**: 
    - Groups are created with `subTargetCheck: false` and `interactive: false`.
    - This ensures the group behaves as a single rigid entity during selection and movement, preventing individual child selection while grouped.

2.  **Ungrouping Strategy**:
    - **Matrix Transformation**: Uses `group.calcTransformMatrix()` and `util.transformPoint()` to manually calculate the absolute coordinates of objects when they are removed from the group.
    - **Object Cloning**: Objects are **cloned** (`obj.clone()`) during the ungroup process. This creates fresh instances detached from the old group context, resolving issues where objects would disappear or fail to render due to lingering internal state.

### Image Filters (FilterManager.js)
The `FilterManager` maps high-level UI actions to specific Fabric.js filter classes:
- **Matrix Filters**: The `Sharpen` filter is implemented via a custom 3x3 convolution matrix that adapts live based on user input strength.
- **Blending**: Tints are applied using the `BlendColor` filter with a `multiply` mode, allowing images to retain texture while changing color.
- **Optimization**: Filters are only applied when values non-zero; zero-value filters are automatically removed from the object's filter stack to maintain performance.

### Dynamic Asset Loading (FontManager.js)
To support a wide range of typography without bloating initial load:
- **Google Fonts Interop**: The `FontManager` dynamically injects `<link>` tags into the document head when a user selects a web font. 
- **Lao Font Support**: Prioritizes local OT/TTF fonts (`Phetsarath OT`) and falls back to Noto Sans Lao for consistent rendering across platforms.

## 5. Color System & Appearance

### Color Picker
A custom-built `ColorPicker.jsx` component provides advanced color selection capabilities:
-   **Integration**: Powered by `react-colorful` for the core color wheel interface.
-   **Features**:
    -   **Hex Input**: Editable input field allowing direct entry of Hex codes (e.g., `#FF5733`).
    -   **Transparency**: Dedicated "No Color" button to set the value to `transparent`.
    -   **Smart Alignment**: Automatically aligns to the left or right of the anchor element based on context (e.g., right-aligned for sidebar properties) to prevent screen overflow.

### Property Application
-   **Fill & Stroke**: Supports both solid colors (strings) and gradients/patterns (objects). The UI visually distinguishes "No Color" with a checkerboard pattern.
-   **Shadows**: Full support for shadow color, blur, and X/Y offsets using range sliders for precision.

## 6. Libraries & Dependencies

The project leverages a modern stack centered around React and Fabric.js:

### Core
-   **`react` / `react-dom` (^19.2.3)**: UI component library.
-   **`vite` (^7.2.4)**: Build tool and development server.
-   **`fabric` (^6.9.1)**: HTML5 Canvas library for vector manipulation.

### UI & Interaction
-   **`lucide-react`**: Icon set for consistent UI symbology.
-   **`react-colorful`**: Lightweight, dependency-free color picker component.
-   **`sweetalert2`**: Beautiful, responsive, customizable replacement for JavaScript's popup boxes.
-   **`sortablejs`**: JavaScript library for reorderable drag-and-drop lists (used for Layers).

### Utilities
-   **`jspdf`**: Client-side PDF generation.

## 7. History System (Undo/Redo)

### Architecture: Memento Pattern
The Undo/Redo system uses a **Memento Pattern** managed by the `HistoryManager` class.
-   **State Capture**: The entire canvas state is serialized to JSON (`canvas.toJSON()`) including custom properties (IDs, locking status, etc.).
-   **Stacks**: Two stacks (`undoStack` and `redoStack`) maintain the history of JSON states.
-   **Isolation**: The history logic is decoupled from the UI state (Zustand) to ensure performance, as canvas state objects can be large.

### Optimization Strategy
-   **Debounced Saves**: To prevent dragging and resizing from flooding the history stack, a **500ms debounce** is applied in `CanvasEvents.js`. The state is only saved after the user pauses interaction.
-   **Capacity Limit**: The history stack is capped (default: 30 steps) to manage memory usage.

### Infinite Canvas Compatibility Fix
A critical challenge with Fabric.js `loadFromJSON` is that it resets the canvas dimensions to the 'page' size defined in the JSON (e.g., 800x600), breaking the 'Infinite Canvas' viewport (which relies on the canvas filling the window).
**Solution**:
-   The `CanvasManager.loadProject()` method was modified to force a **viewport resize calculation** (`viewport.handleWindowResize()`) immediately after the JSON data is loaded.
-   This ensures the physical canvas backing is instantly restored to full-screen dimensions, preventing rendering artifacts (blue void glitches) and maintaining seamless infinite scrolling.

## 8. Background Removal System

### Library
- **`@huggingface/transformers`**: Specifically, the **RMBG-1.4** model by BRIA AI.
- **Why RMBG-1.4**: Chosen for its superior edge detection on general objects (products, animals) compared to selfie-focused models like MediaPipe.
- **Implementation**: Runs entirely client-side via ONNX Runtime Web.

### Technical Challenges & Solutions

#### A. RawImage Channel Format Error
Failed to use `RawImage.fromTensor()` due to RMBG-1.4 outputting a single-channel mask that the library didn't auto-convert correctly in the browser environment.
**Solution**: Implemented **Manual Tensor Processing**:
1.  Extracted the raw `maskTensor.data` (Float32 or Uint8).
2.  Manually constructed a 4-channel `Uint8ClampedArray` (RGBA).
3.  Set R=0, G=0, B=0, and mapped the tensor value to Alpha.
4.  Created an `ImageData` object directly from this array for the canvas.

#### B. Memory & Performance
-   **Model Caching**: The model (~170MB) is cached by the browser after the first load.
-   **Async Initialization**: The service checks for `model` and `processor` existence before re-initializing to prevent redundant loads.

## 9. Text Extraction System (OCR)

### Library
- **`tesseract.js`**: A pure JavaScript port of the famous Tesseract OCR engine.
- **Languages**: Updated to support **Lao (`lao`)** and **English (`eng`)** simultaneously (`lao+eng`).

### Implementation Strategy
- **Worker Architecture**: Runs Tesseract in a web worker to prevent blocking the main UI thread during heavy image processing.
- **Language Data**: Automatically fetches `.traineddata` files for Lao and English on demand.
- **Integration**:
    -   **One-Click Action**: Exposed via `ImageEffectsPanel` alongside other AI tools.
    -   **Auto-Conversion**: Extracted text is automatically converted into an editable `IText` object with the default Lao font (`Phetsarath OT`), placed near the original image for immediate verification and editing.

## 10. Stock Photo Integration

### Service
- **Provider**: **Unsplash API**.
- **Functionality**:
    -   **Search**: Query-based search with pagination support.
    -   **Download Tracking**: Complies with Unsplash Guidelines by triggering the download endpoint.
    -   **Authentication**: Supports both a baked-in default Access Key (for immediate usability) and a user-provided custom key (persisted in `localStorage`).

### UI Integration
- **View Switching**: The `ElementsPanel` toggles between the local asset grid and the remote stock photo grid.
- **API Key Management**: If the default key fails or is removed, a secure input field prompts the user to enter their own credential.

## 11. QR Code Generator

### Library
- **`qrcode`**: Popular JavaScript library for QR code generation.

### Functionality
- **Vector Output**: Generates Scalable Vector Graphics (SVG) instead of raster images, ensuring QR codes remain crisp even when printed on large formats (banners/posters).
- **Customization**: Users can input text/URLs and select a custom foreground color.
- **Integration**: Accessed via `ElementsPanel`, generating a grouped SVG object on calculation.

## 12. Barcode Generator

### Library
- **`jsbarcode`**: Robust library for generating various 1D barcode formats.

### Functionality
- **Supported Formats**: CODE128 (Standard), EAN13 (Retail), UPC (US Retail), ITF, MSI, Codabar.
- **Vector Output**: Generates Scalable Vector Graphics (SVG) via intermediate DOM element serialization.
- **Customization**:
    -   **Value**: Input text/number.
    -   **Format**: Dropdown selection.
    -   **Line Color**: Customizable for design integration.
    -   **Show Text**: Toggle to display human-readable text below the bars.

## 13. Emoji Picker Integration

### Library
- **`emoji-picker-react`**: A comprehensive, high-performance React emoji picker component.

### Functionality
- **Selection**: Provides a familiar, categorized, and searchable interface for selecting emojis.
- **Theme**: Automatically styled to match the application's dark theme (`theme="dark"`).
- **Integration**: Selected emojis are added to the canvas as scalable **Text Objects** (not images), ensuring crisp rendering and easy resizing/recoloring via standard text tools.

## 14. Icon Library Integration

### Service
- **`IconService.js`**: Interacts with the **Iconify API** (https://api.iconify.design).

### Functionality
- **Search**: Users can search for icons across multiple sets (Material Design, FontAwesome, etc.).
- **Vector Output**: Icons are fetched as raw SVG strings and added to the canvas as scalable vector objects.
- **Performance**: Icons are loaded on-demand, keeping the initial bundle size low.

## 15. Chart Generator

### Library
- **`chart.js`** & **`react-chartjs-2`**: Standard, powerful charting library.

### Functionality
- **Supported Types**: Bar, Line, Pie, Doughnut.
- **Live Preview**: Real-time rendering of the chart within the panel before adding.
- **Customization**:
    -   **Data/Labels**: Simple comma-separated input.
    -   **Colors**: Primary color customization (auto-palette for Pie/Doughnut).

## 16. Advanced Export System

### Features
- **Formats**: PNG, JPEG (with Quality control), PDF.
- **Resolution Scaling**: Supports 1x, 2x, 3x, 4x multipliers for high-density exports (e.g., 4k printing).
- **PDF Generation**:
    -   Automatically matches the PDF page size to the layout dimensions (e.g., A4, 1080x1080).
    -   **Viewport Fix**: Temporarily resets the view (Zoom 100%, Pan 0,0) during export to ensure the **entire canvas** is captured without cropping, regardless of the user's current zoom level.

## 17. Dashboard & Project Management

### Dashboard (`index.html`)
- **Clean Interface**: A focused "Create New" and "Template Selection" hub.
- **Performance**: Removed unused editor sidebars (Layers, Elements) for faster load times.
- **Loading State**: Professional spinner animation during template fetching.

### Save System
- **JSON Export**: The "Save Project" button generates a timestamped `.json` file containing the full state.
- **Infinite Canvas Rescue**: The `loadProject` method now includes an explicit `viewport.handleWindowResize()` call. This fixes a critical bug where loading a project would shrink the physical canvas to the workspace bounds, breaking the infinite panning capability.






