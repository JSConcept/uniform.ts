// deno-lint-ignore-file no-explicit-any
export const makeModuleLoader = (exChanger: any, altName: string = "!!import!!")=>{
    // make import loader support
    exChanger?.register?.((src: string = ""): Promise<any> => {
        return import(/* @vite-ignore */ src)?.then(async ($m)=>{
            const { wrapExChanger, transfer, doTransfer } = await import("../Library/Utils/Useful.ts");
            if (typeof $m?.importContext == "function") { $m?.importContext?.(wrapExChanger(exChanger), {
                transfer, doTransfer
            }); }
            return $m;
        });
    }, altName || "!!import!!");
    return exChanger;
}

//
export default makeModuleLoader;
