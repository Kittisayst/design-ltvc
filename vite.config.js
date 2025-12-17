import { defineConfig } from 'vite'

export default defineConfig({
    // Use relative paths ('./') so the app works in a subdirectory (like on GitHub Pages: username.github.io/repo-name)
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                canvas: 'canvas.html'
            }
        }
    }
})
