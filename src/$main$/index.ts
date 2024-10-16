// deno-lint-ignore-file no-explicit-any
import { $moduleLoader } from "./loader";
import { $wrapPromise  } from "../$core$/Library/Handlers/PromiseHandler";

// wrapper of module loader (with Proxy)
export const moduleLoader = <T extends unknown>(source: string = "")=>{
    return /*@__MANGLE_PROP__*/ $wrapPromise(import("../$worker$/code.ts")?.then?.(async (worker: any)=>{
        return /*@__MANGLE_PROP__*/ $moduleLoader<T>(source, await (worker?.default || ""))?.catch?.(console.trace.bind(console));
    }));
}

//
export default moduleLoader;
export * from "./utils.ts";
