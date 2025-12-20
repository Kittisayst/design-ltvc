# System Overview: Poster Designer Pro

## 1. Project Architecture

The project is a web-based vector design application built with **Vite** and **Fabric.js**. It follows a modular architecture separating core canvas logic from UI management.

### Directory Structure

- **`src/core/`**: Contains the business logic for the canvas.
  - `CanvasManager.js`: The central controller. Manages the Fabric.js canvas instance, tools, and object manipulation.
  - `CanvasViewport.js`: Handles zooming, panning, and responsive workspace resizing.
  - `CanvasEvents.js`: Manages event listeners (selection, transformation, mouse interaction).
  - `HistoryManager.js`: Implements Undo/Redo functionality using a state stack.

- **`src/ui/`**: Manages the DOM elements and panels.
  - `UIManager.js`: Main entry point for UI. Initializes all panels and binds global events.
  - `PropertyPanel.js`: Context-sensitive properties panel (updates based on selected object).
  - `LayersPanel.js`: Manages the layer stack (ordering, visibility, locking).
  - `ElementsPanel.js`: Handles the "Elements" sidebar tab (shapes, local assets, library).
  - `ExportPanel.js`: Manages export logic (PNG, SVG, PDF).
  - `TemplatesPanel.js`: Handles loading templates from JSON.
  - `ContextMenu.js`: Manages the right-click context menu and its actions.
  - `FloatingToolbar.js`: Context-aware floating toolbar shown near the selection.
  - `RulerManager.js`: Manages canvas rulers and guide lines.
  - `NotificationManager.js`: Handles system notifications (success/error toasts).
  - `AdvancedColorPicker.js`: Custom color picker component.

- **`public/`**: Static assets.
  - `data/elements.json`: Configuration for the Element Library.
  - `data/templates.json`: Metadata for available templates.

## 2. Core Capabilities

### Canvas & Workspace
- **Infinite Canvas**: The "physical" canvas fills the screen, while the "logical" workspace is a defined area (e.g., A4, Social Media Post) centered within it.
- **Viewport Controls**:
  - **Zoom**: In, Out, Reset, Fit to Screen.
  - **Pan**: Hand tool (Spacebar or UI button) for moving around the workspace.
  - **Resize**: Custom dimensions for the logical workspace.
- **Background**:
  - **Solid Color**: Interactive color picker.
  - **Gradient**: Linear gradients with customizable start/end colors and direction.

### Object Support
The system supports divers object types via `CanvasManager`:
- **Shapes**:
  - Basic: Rectangle, Circle, Triangle.
  - Advanced (via `shapeConfig`): Star, Pentagon, Hexagon, Arrow, Heart, Message Box.
- **Text**:
  - Rich text editing (IText).
  - Rich text editing (IText).
  - Customization:
    - Font Family: Google Fonts and local Lao fonts (Phetsarath OT, Noto Sans Lao).
    - Typography: Size, Color, Bold, Italic, Underline.
    - Spacing: Line Height, Letter Spacing.
    - Alignment: Left, Center, Right, Justify.
- **Images**:
  - Upload from local storage.
  - Tinting support (color overlay).
- **SVG**:
  - Import from URL.
  - Group handling (treats complex SVGs as groups).
  - Fill color override for entire groups.

### Object Manipulation
- **Transformation**: Move, Resize, Rotate.
- **Alignment**:
  - Relative to Workspace: Center, Center H/V.
  - Relative to Selection: Left, Center, Right, Top, Middle, Bottom.
- **Arrangement**: Bring Forward, Send Backward (Layer ordering).
- **Organization**:
  - **Grouping**: Combine multiple objects into a single selectable unit (Support for nested groups).
  - **Locking**: specific locks for movement, scaling, and rotation.
  - **Flipping**: Horizontal and Vertical flip.
  - **Duplication**: Clone selected objects.
  - **Clipboard**: Copy and Paste support.
  - **Draw Mode**: Freehand drawing with customizable brush color and width (`PencilBrush`).

### Workflow Enhancements
- **Shortcuts**:
  - `Delete`/`Backspace`: Delete object.
  - `Ctrl+Z` / `Ctrl+Y`: Undo / Redo.
  - `Ctrl+G` / `Ctrl+Shift+G`: Group / Ungroup.
- **Context Menu**: Right-click menu for quick access to Copy, Paste, Lock/Unlock, Layering, and Grouping.
- **Layers Panel**:
  - **Multi-Selection**: Support for Shift-Click (add/range) and Ctrl-Click (toggle).
  - **Management**: Reordering (Drag & Drop), Visibility toggle, Locking toggle, Renaming.

### Smart Features
- **Smart Guides**: Auto-snapping to the center of the page and edges/centers of other objects during movement.
- **History System**: Robust Undo/Redo stack for canvas state changes.

## 3. Data & IO

### Save / Load
- **JSON Format**: Projects are saved as JSON files containing all canvas data (objects, dimensions, background).
- **Template System**: Templates are pre-defined JSON files that can be loaded to overwrite the current workspace.

### Export
- **PNG**: Raster export with quality scaling (1x - 4x).
- **SVG**: Vector export for further editing in tools like Illustrator.
- **PDF**: Client-side PDF generation using `jspdf`, matching the logical workspace dimensions.
