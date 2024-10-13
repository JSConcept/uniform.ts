// just compressed base64 encoded string, we currently doesn't supports native wrappers from custom vite
// `inline` will also ignored in custom vite bundle, prior of `compress`
import IW from "../Workers/ModuleWorker.ts?worker&compress&inline";

// deno-lint-ignore-file
import loadWorker, {loadWorkerCompressed} from "../Atomic/WorkerLib.ts";
import ObjectProxy from "../Atomic/ObjectProxy.ts";
// you needs custom Vite bundle to compile less sized bundles

//
const $moduleLoader = async <T extends unknown>(moduleSource: string): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    // if url too long, un-compress code
    const  uWorker  = (IW as unknown as string)?.length >= 1024 ? (await loadWorkerCompressed(IW as unknown as string)) : loadWorker(IW);
    const EXChanger = (await import("../Library/FLOW/ExChanger.ts")).default;
    const exChanger = new EXChanger(uWorker)?.initialize?.();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(moduleSource);

    //
    return module;
}

//
import {MakeReference, PromiseHandler} from "../Library/Shared.ts";
export const moduleLoader = <T extends unknown>(source: string)=>{
    return new Proxy(MakeReference($moduleLoader<T>(source)?.catch?.(console.trace.bind(console))), new ObjectProxy(new PromiseHandler()));
}
export default moduleLoader;
