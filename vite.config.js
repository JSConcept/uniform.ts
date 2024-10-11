import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { compression } from 'vite-plugin-compression2'
import optimizer from 'vite-plugin-optimizer'
import { viteSingleFile } from "vite-plugin-singlefile"
import typescript from '@rollup/plugin-typescript';
import dynamicImport from 'vite-plugin-dynamic-import'

//
const __dirname = import.meta.dirname;

//
export default defineConfig({
    plugins: [
        typescript(),
        dynamicImport(/* options */),
        compression(),
        optimizer({}),
        viteSingleFile()
    ],
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173",
    },
    worker: {
        format: "es"
    },
    build: {
        assetsInlineLimit: 1024 * 1024,
        minify: 'esbuild',
        sourcemap: "inline",
        target: "ESNext",
        lib: {
            formats: ["es"],
            entry: resolve(__dirname, './index.ts'),
            name: 'uniform',
            fileName: 'uniform',
        },
        rollupOptions: {
            external: [],
            output: {
                exports: "named",
                inlineDynamicImports: true,
                globals: {},
            },
        },
    },
    esbuild: {
        sourcemap: "inline",
        minify: true
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "ESNext"
        }
    }
});
