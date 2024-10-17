import { terserOptions} from "./shared.config.js"
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { compression } from 'vite-plugin-compression2';
import optimizer from 'vite-plugin-optimizer';
import GZP from "./plugins/compress.mjs";

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
        "declarationDir": "./dist/worker.d.ts/",
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
    compression(), 
    GZP()
];

//
const NAME = "worker";
export const wRollupOptions = {
    plugins: [...plugins],
    treeshake: 'smallest',
    external: [],
    input: "./src/Workers/ModuleWorker.ts",
    output: {
        //preserveModules: true,
        minifyInternalExports: true,
        compact: true,
        globals: {},
		format: 'es',
		name: NAME,
        dir: './dist',
        sourcemap: 'hidden',
        exports: "auto",
        esModuleInterop: true,
        experimentalMinChunkSize: 500_500,
        inlineDynamicImports: true,
	}
};
