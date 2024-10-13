// deno-lint-ignore-file no-explicit-any
// just compressed base64 encoded string, we currently doesn't supports native wrappers from custom vite
// `inline` will also ignored in custom vite bundle, prior of `compress`
import $raw$ from "../Workers/ModuleWorker.ts?worker&compress&inline"; const IW = $raw$; // put into start of code
const PRELOAD = (IW as unknown as string)?.length >= 1024 ? loadCompressed(IW as unknown as string) : IW;

//
import loadWorker, {loadCompressed} from "../Atomic/WorkerLib.ts";
const $moduleLoader = async <T extends unknown>(moduleSource: string): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    // if url too long, un-compress code
    const  uWorker  = loadWorker(await PRELOAD);
    const EXChanger = (await import("../Library/FLOW/ExChanger.ts")).default;
    const exChanger = new EXChanger(uWorker)?.initialize?.();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(moduleSource);

    //
    return module;
}

//
import ObjectProxy from "../Atomic/ObjectProxy.ts";
import {MakeReference, PromiseHandler} from "../Library/Shared.ts";
export const moduleLoader = <T extends unknown>(source: string)=>{
    return new Proxy(MakeReference($moduleLoader<T>(source)?.catch?.(console.trace.bind(console))), new ObjectProxy(new PromiseHandler()));
}
export default moduleLoader;
