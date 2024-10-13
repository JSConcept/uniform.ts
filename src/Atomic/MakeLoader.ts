// deno-lint-ignore-file no-explicit-any
export const makeModuleLoader = (exChanger: any, altName: string = "!!import!!")=>{
    // make import loader support
    exChanger?.register?.((src: string = ""): Promise<any> => import(/* @vite-ignore */ src), altName || "!!import!!");
    return exChanger;
}

//
export default makeModuleLoader;
