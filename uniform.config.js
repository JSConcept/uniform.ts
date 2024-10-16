import { defineConfig } from "vite";
import { resolve } from "node:path";
import { terserOptions } from "./shared.config.js"
import { wRollupOptions } from "./worker.config.js";
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { compression } from 'vite-plugin-compression2';
import optimizer from 'vite-plugin-optimizer';

//
export const TSConfig = {
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "lib": ["ESNext", "DOM", "WebWorker"],
        "esModuleInterop": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "allowJs": true,
        "allowArbitraryExtensions": true,
        "allowSyntheticDefaultImports": true,
        "allowUmdGlobalAccess": true,
        "allowUnreachableCode": true,
        "allowUnusedLabels": true,
        "noImplicitAny": false,
        "declaration": true,
        "noImplicitThis": false,
        "inlineSources": true,
        "inlineSourceMap": true,
        "sourceMap": false,
        "outDir": "./dist/",
        "declarationDir": "./dist/uniform.d.ts/",
        "allowImportingTsExtensions": true,
        "emitDeclarationOnly": true,
        "typeRoots": ["plugins/global.d.ts"]
    }
};

//
export const plugins = [
    typescript(TSConfig),
    terser(terserOptions),
    optimizer({}),
    compression()
];

//
const NAME = "uniform";
const uRollupOptions = {
    plugins,
    treeshake: 'smallest',
    external: [],
    input: "./src/$main$/index.ts",
    output: {
        //preserveModules: true,
        minifyInternalExports: true,
        compact: true,
        globals: {},
		format: 'es',
		name: NAME,
        dir: './dist',
        /*entryFileNames: '[name].mjs',
        assetFileNames: 'deps/[name].[ext]',
        chunkFileNames: 'deps/[name].mjs',*/
        sourcemap: 'hidden',
        exports: "auto",
        esModuleInterop: true,
        experimentalMinChunkSize: 500_500,
        inlineDynamicImports: true,
	}
};

//
export default defineConfig({
    plugins,
    worker: {
        name: "worker",
        plugins: ()=> plugins,
        format: "es",
        rollupOptions: wRollupOptions   
    },
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
        rollupOptions: uRollupOptions,
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
            resolve(__dirname, './src/$worker$/index.ts'),
            resolve(__dirname, './src/$main$/index.ts')
        ],
        force: true
    }
});
