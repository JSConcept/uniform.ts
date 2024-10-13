// deno-lint-ignore-file no-explicit-any
// just compressed base64 encoded string, we currently doesn't supports native wrappers from custom vite
// `inline` will also ignored in custom vite bundle, prior of `compress`
//import $raw$ from "../Workers/ModuleWorker.ts?worker&compress&inline"; const IW = $raw$; // put into start of code
import $raw$ from "../Workers/ModuleWorker.ts?worker&compress"; const IW = $raw$; 

//
const loadCompressed = async (b64c: string): Promise<string|null> => {
    const blob = new Blob([Uint8Array.from(atob(b64c), c => c.charCodeAt(0))], {type: "application/gzip"});
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    const response = await (new Response(decompressedStream, {headers: new Headers({"Content-Type": "application/javascript" })})).blob();
    return URL.createObjectURL(response);
}

//
const PRELOAD = !URL.canParse(IW) ? loadCompressed(IW as unknown as string) : IW;

//
const $moduleLoader = async <T extends unknown>(moduleSource: string): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    // if url too long, un-compress code
    const {loadWorker} = await import("../Atomic/WorkerLib.ts");
    const uWorker   = loadWorker(await PRELOAD);
    const EXChanger = (await import("../Library/FLOW/ExChanger.ts")).default;
    const exChanger = new EXChanger(uWorker)?.initialize?.();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(moduleSource);

    //
    return module;
}

//
import { $wrapPromise } from "../Library/Handlers/PromiseHandler.ts";
export const moduleLoader = <T extends unknown>(source: string)=>{
    return $wrapPromise($moduleLoader<T>(source)?.catch?.(console.trace.bind(console)));
}
export default moduleLoader;
