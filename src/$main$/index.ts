// deno-lint-ignore-file no-explicit-any
import { $moduleLoader } from "./loader";
import { $wrapPromise  } from "../$core$/Library/Handlers/PromiseHandler";

// wrapper of module loader (with Proxy)
export const moduleLoader = <T extends unknown>(source: string = "")=>{
    return /*@__MANGLE_PROP__*/ $wrapPromise(import("../$worker$/code")?.then?.(async (worker: any)=>{
        return /*@__MANGLE_PROP__*/ $moduleLoader<T>(source, await (worker?.default || ""))?.catch?.(console.trace.bind(console));
    }));
}

//
import ORG from "../$core$/Library/Utils/OrganicType";
export const sync = ORG.sync;
export { getContext, transfer, doTransfer } from "../$core$/Library/Utils/Useful";


//
//, { ORG }export * from "./utils";
//export * from "./utils.ts";
