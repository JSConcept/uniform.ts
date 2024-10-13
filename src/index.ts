// deno-lint-ignore-file no-explicit-any
import { $moduleLoader } from "./loader.ts";
import { $wrapPromise  } from "./Library/Handlers/PromiseHandler.ts";
export const moduleLoader = <T extends unknown>(source: string = "")=>{
    return $wrapPromise(import("./code.ts")?.then?.(async (worker: any)=>{
        return $moduleLoader<T>(source, await (worker?.default || ""))?.catch?.(console.trace.bind(console));
    }));
}
export default moduleLoader;

// default export
import ORG from "./Library/Utils/OrganicType.ts";
export const sync = ORG.sync;
export { getContext, transfer, doTransfer } from "./Library/Utils/Useful.ts";
