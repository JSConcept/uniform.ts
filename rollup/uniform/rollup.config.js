

import {resolve} from "node:path";
import terserOptions from "../shared.config"
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { compression } from 'vite-plugin-compression2';
import optimizer from 'vite-plugin-optimizer';

//
export const __dirname = resolve(import.meta.dirname, "../../");
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
export const NAME = "uniform";
export const rollupOptions = {
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

export default rollupOptions;
