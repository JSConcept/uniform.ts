import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { compression } from 'vite-plugin-compression2'
import optimizer from 'vite-plugin-optimizer'
import { viteSingleFile } from "vite-plugin-singlefile"
import typescript from '@rollup/plugin-typescript';
import dynamicImport from 'vite-plugin-dynamic-import'
//import { ViteMinifyPlugin } from 'vite-plugin-minify'
import terser from '@rollup/plugin-terser';

//
const __dirname = import.meta.dirname;
const terserOptions = {
    keep_classnames: true,
    keep_fnames: true,
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
        //dynamicImport(/* options */),
        compression(),
        optimizer({}),
        viteSingleFile(),
        terser(terserOptions)
        //ViteMinifyPlugin({}),
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
        sourcemap: false,//"inline",
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
    }
});
