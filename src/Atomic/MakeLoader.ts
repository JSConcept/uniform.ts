import { wrapExChanger, transfer, doTransfer } from "../Library/Utils/Useful.ts";
// deno-lint-ignore-file no-explicit-any
export const makeModuleLoader = (exChanger: any, altName: string = "!!import!!")=>{
    // make import loader support
    exChanger?.register?.((src: string = ""): Promise<any> => {
        const $module$ = import(/* @vite-ignore */ src);
        $module$?.then(($m)=>{
            if (typeof $m?.importContext == "function") { $m?.importContext?.(wrapExChanger(exChanger), {
                transfer, doTransfer
            }); }
            return $m;
        });
        return $module$;
    }, altName || "!!import!!");

    return exChanger;
}

//
export default makeModuleLoader;
