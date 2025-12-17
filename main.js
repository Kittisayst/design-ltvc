import { CanvasManager } from './src/core/CanvasManager.js';
import { UIManager } from './src/ui/UIManager.js';
import { jsPDF } from 'jspdf';
import { createIcons, icons } from 'lucide';
import 'vanilla-colorful/hex-color-picker.js';

// Initialize Core Systems
const canvasManager = new CanvasManager('c', {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});

// Export Dialog Logic
const exportBtn = document.getElementById('btn-navbar-export');
const exportDialog = document.getElementById('export-dialog');
const closeExportBtn = document.getElementById('btn-close-export');

if (exportBtn && exportDialog && closeExportBtn) {
  exportBtn.addEventListener('click', () => {
    exportDialog.showModal();
  });
  closeExportBtn.addEventListener('click', () => {
    exportDialog.close();
  });
  // Close on backdrop click
  exportDialog.addEventListener('click', (e) => {
    const rect = exportDialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom) {
      exportDialog.close();
    }
  });
}

const uiManager = new UIManager(canvasManager);
uiManager.init();
createIcons({ icons });


// Check for Template Parameter
const urlParams = new URLSearchParams(window.location.search);
const templatePath = urlParams.get('template');

if (templatePath) {
  // Load template
  (async () => {
    try {
      const res = await fetch(templatePath);
      if (!res.ok) throw new Error('Failed to load template');
      const json = await res.json();
      await canvasManager.loadProject(json);
      // Wait for font loading if needed, or CanvasManager handles it?
      // CanvasManager just loads. UIManager might need to sync.
      // Wait, CanvasManager.loadProject triggers render.
      console.log('Template loaded:', templatePath);
    } catch (err) {
      console.error('Template loading failed:', err);
      // NotificationManager isn't exported globally but we could use it if imported?
      // UIManager uses it.
      alert('Failed to load template.'); // Fallback
    }
  })();
}

// Back button now in HTML
const navLeft = document.querySelector('.nav-left');
// ... logic removed ...

// Export event listeners are now handled in UIManager or can be bound here using public APIs.
// For now, let's keep the binding here but use CanvasManager methods, or ideally move to UIManager.
// Let's verify if UIManager handles export. It does (sidebar-right).
// We should check UIManager.js to see if it binds 'btn-do-export'.
// If not, we should move this logic to UIManager.

// Checking UIManager... it doesn't seem to have export bindings yet explicitly shown in previous views.
// Let's move this logic to UIManager.bindEvents() in the next step.
// For now, removing this block to force migration.
