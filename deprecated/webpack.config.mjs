import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { type } from "node:os";
import path, { dirname, resolve } from "node:path";

//
const require = createRequire(import.meta.url)
const __dirname = import.meta.dirname;
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//
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
}

//
export default {
    output: {
        filename: './[name].mjs',
        path: resolve(__dirname, 'dist/uniform.mjs'),
        crossOriginLoading: 'anonymous',
        chunkFilename: "./deps/[name].mjs",
        library: {
            type: "module",
        },
        chunkFormat: 'module',
		module: true,
    },
    entry: resolve(__dirname, 'src/index.mjs'),
    module: {
        rules: [
            {   // library...
                include: [
                    resolve(__dirname, "src")
                ],
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    },
    context: __dirname,
    cache: true,
    resolve: {
        extensions: ['.ts', '.js', '.mjs'],
    },
    optimization: {
        mangleExports: true,
        mangleWasmImports: true,
        usedExports: 'global',
        mergeDuplicateChunks: true,
        moduleIds: 'deterministic',
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions
            })
        ],
        splitChunks: {
            chunks: 'async',
            minSize: 1024 * 1024,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            filename: './deps/[name].mjs',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    filename: './deps/[name].mjs',
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                    filename: './deps/[name].mjs',
                },
            },
        }
    },
    target: ["es2024","web","webworker"],
    plugins: [
        new CleanWebpackPlugin({
            verbose: true,
            cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json'],
        }),
    ],
    experiments: {
        outputModule: true
    }
};
