// deno-lint-ignore-file no-explicit-any
// just compressed base64 encoded string, we currently doesn't supports native wrappers from custom vite
// `inline` will also ignored in custom vite bundle, prior of `compress`
//import $raw$ from "../Workers/ModuleWorker.ts?worker&compress&inline"; const IW = $raw$; // put into start of code

// deno-lint-ignore-file no-explicit-any
const loadWorker = (WX: any): Worker|null =>{
    if (WX instanceof Worker) { return WX; } else
    if (typeof WX == "function") { return new WX(); } else 
    if (typeof WX == "string") {
        if (URL.canParse(WX)) { return new Worker(WX, {type: "module"}); };
        return new Worker(URL.createObjectURL(new Blob([WX], {type: "application/javascript"})), {type: "module"});
    } else
    if (WX instanceof Blob || WX instanceof File) {
        return new Worker(URL.createObjectURL(WX), {type: "module"});
    }
    return (typeof self != "undefined" ? self : null) as unknown as Worker;
}

//
export const $moduleLoader = async <T extends unknown>(moduleSource: string, workerCode: string = ""): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    // if url too long, un-compress code
    const uWorker   = loadWorker(workerCode);
    const EXChanger = (await import("./Library/FLOW/ExChanger.ts")).default;
    const exChanger = new EXChanger(uWorker)?.initialize?.();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(moduleSource);

    //
    return module;
}
