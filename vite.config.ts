import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // jsxImportSource: '@welldone-software/why-did-you-render',
        }),
    ],

    server: {
        hmr: false,
    },

    build: {
        sourcemap: true,
        target: 'chrome104',
    },

    base: './',
})
