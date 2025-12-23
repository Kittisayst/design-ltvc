import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // Use relative paths ('./') so the app works in a subdirectory (like on GitHub Pages: username.github.io/repo-name)
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                canvas: 'canvas.html'
            }
        }
    },
    define: {
        global: 'window',
    },
    optimizeDeps: {
        include: [
            'upscaler',
            '@tensorflow/tfjs',
            '@mediapipe/tasks-vision'
        ]
    }
})
