// deno-lint-ignore-file

//
import W from "../Workers/ModuleWorker.ts?worker&inline";
//const W = new URL("./Workers/ModuleWorker.ts", import.meta.url).href;

// should be converted to inline code, and compiled from TS
//
import loadWorker from "../Atomic/WorkerLib.ts";
import ObjectProxy from "../Atomic/ObjectProxy.ts";

//
const $moduleLoader = async <T extends unknown>(moduleSource: string): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    //
    const  uWorker  = loadWorker(W);
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
