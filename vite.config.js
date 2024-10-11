import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { compression } from 'vite-plugin-compression2'
import optimizer from 'vite-plugin-optimizer'
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

//
const __dirname = import.meta.dirname;
const terserOptions = {
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    ecma: 2020,
    compress: {
        arguments: true,
        expression: true,
        inline: 3,
        module: true,
        passes: 2,
        side_effects: true,
        unsafe: true,
        unsafe_comps: true,
        unsafe_arrows: true,
        unsafe_math: true,
        unsafe_symbols: true,
        warnings: true
    }
};

//
export default defineConfig({
    plugins: [
        typescript(),
        terser(terserOptions),
        optimizer({}),
        compression()
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
        chunkSizeWarningLimit: 1600,
        assetsInlineLimit: 1024 * 1024,
        minify: "terser",
        sourcemap: 'hidden',
        target: "esnext",
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
        terserOptions
    },
    optimizeDeps: {
        include: [
            "./node_modules/**/*.mjs", 
            "./node_modules/**/*.js", 
            "./node_modules/**/*.ts", 
            "./src/**/*.mjs", 
            "./src/**/*.js", 
            "./src/**/*.ts", 
            "./src/*.mjs", 
            "./src/*.js",
            "./src/*.ts",
            "./test/*.mjs", 
            "./test/*.js",
            "./test/*.ts"
        ],
        entries: [
            resolve(__dirname, './src/Workers/ExChangerUnit.ts'), 
            resolve(__dirname, './src/Workers/InlineWorkers.ts'), 
            resolve(__dirname, './src/Workers/ModuleWorker.ts'),
            resolve(__dirname, './utils.ts'), 
            resolve(__dirname, './index.ts'), 
            resolve(__dirname, './test/Host.ts')
        ],
        force: true
    }
});
