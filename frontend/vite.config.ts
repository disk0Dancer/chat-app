import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
    plugins: [
        react(),
        NodeGlobalsPolyfillPlugin({
            // process: true,
            // buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
    ],
    resolve: {
        alias: {
            // process: 'process/browser',
            // stream: 'stream-browserify',
            // zlib: 'browserify-zlib',
            // util: 'util',
            // crypto: 'crypto-browserify',
            // fs: 'browserify-fs',
            // buffer: 'buffer',
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
});