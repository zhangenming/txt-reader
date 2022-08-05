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
        // base: '/txt-reader/dist/',
        // sourcemap: true,
        target: 'chrome 104',
    },

    // base: '/txt-reader/dist/',
    base: './',
})
