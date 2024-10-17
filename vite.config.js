import rollupOptions, {plugins, NAME} from "./rollup/uniform/rollup.config";
import {worker} from "./rollup/worker/rollup.config";
import terserOptions from "./rollup/shared.config";
import {resolve} from "node:path";

//
export const __dirname = resolve(import.meta.dirname, "./");

//
export default {
    plugins,
    worker,
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173",
    },
    build: {
        chunkSizeWarningLimit: 1600,
        assetsInlineLimit: 1024 * 1024,
        minify: "terser",
        sourcemap: 'hidden',
        target: "esnext",
        name: NAME,
        lib: {
            formats: ["es"],
            entry: resolve(__dirname, './src/main/index.ts'),
            name: NAME,
            fileName: NAME,
        },
        rollupOptions,
        //terserOptions
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
            resolve(__dirname, './src/$worker$/index.ts'),
            resolve(__dirname, './src/$main$/index.ts')
        ],
        force: true
    }
}