import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

//
const __dirname = import.meta.dirname;

//
export default defineConfig({
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173/",
    },
    build: {
        lib: {
            entry: resolve(__dirname, './index.ts'),
            name: 'uniform',
            fileName: 'uniform.mjs',
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "ESNext"
        }
    }
});
