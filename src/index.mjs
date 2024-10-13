//
import { $moduleLoader } from "./loader.ts";
import { $wrapPromise  } from "./Library/Handlers/PromiseHandler.ts";

//
export const moduleLoader = (source = "")=>{
    return /*@__MANGLE_PROP__*/ $wrapPromise(import("./code.ts")?.then?.(async (worker)=>{
        return /*@__MANGLE_PROP__*/ $moduleLoader<T>(source, await (worker?.default || ""))?.catch?.(console.trace.bind(console));
    }));
}

//
export default moduleLoader;
import ORG from "./Library/Utils/OrganicType.ts";
export const sync = ORG.sync;
export { getContext, transfer, doTransfer } from "./Library/Utils/Useful.ts";
