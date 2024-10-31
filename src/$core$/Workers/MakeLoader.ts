// deno-lint-ignore-file no-explicit-any
export const makeModuleLoader = (exChanger: any, altName: string = "!!import!!")=>{
    // make import loader support
    const $import$ = (src: string = ""): Promise<any> => {
        return import(src)?.then(async ($m)=>{
            const { wrapExChanger, transfer, doTransfer } = await import("../Library/Utils/Useful");
            if (typeof $m?.$importContext$ == "function") { $m?.$importContext$?.({
                ctx: wrapExChanger(exChanger),
                utils: {transfer, doTransfer}
            }); }
            return $m;
        });
    };

    // is direct
    if (typeof exChanger?.register == "function") {
        exChanger?.register?.($import$, altName || "!!import!!");
    } else 

    // is may be wrapper
    if (typeof exChanger == "object" || typeof exChanger == "function") {
        exChanger["!!import!!"] = $import$;
    }

    //
    return exChanger;
}

//
export default makeModuleLoader;
