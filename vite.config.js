import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // Use relative paths ('./') so the app works in a subdirectory (like on GitHub Pages: username.github.io/repo-name)
    base: './',
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        exclude: ['e2e/**', 'node_modules/**'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-fabric': ['fabric'],
                    'vendor-pdf': ['jspdf'],
                    'vendor-chart': ['chart.js', 'react-chartjs-2'],
                }
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
