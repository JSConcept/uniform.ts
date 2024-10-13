

//
const __dirname = import.meta.dirname;
export const terserOptions = {
    ecma: 2020,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    toplevel: true,
    mangle: {
        keep_classnames: false,
        keep_fnames: false,
        module: true,
        toplevel: true,
    },
    compress: {
        ecma: 2020,
        keep_classnames: false,
        keep_fnames: false,
        keep_infinity: false,
        reduce_vars: true,
        reduce_funcs: true,
        pure_funcs: [],
        arguments: true,
        expression: true,
        inline: 3,
        module: true,
        passes: 3,
        side_effects: true,
        pure_getters: true,
        typeofs: true,
        toplevel: true,
        unsafe: true,
        unsafe_Function: true,
        unsafe_comps: true,
        unsafe_arrows: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_undefined: true,
        unsafe_methods: true,
        warnings: true,
        unused: true,
        booleans_as_integers: true,

        // don't use in debug mode
        drop_console: true
    },
    format: {
        braces: false,
        comments: false,
        ecma: 2020,
        indent_level: 0,
        semicolons: true,
        shebang: true
    }
};
