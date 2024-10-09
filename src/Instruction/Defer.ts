// deno-lint-ignore-file no-explicit-any
import DataHandler from "../Handlers/DataHandler.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import SharedChannel from "../Utils/SharedChannel.ts";
import { $data, MakeReference } from "./InstructionType.ts";
import ObjectProxy from "./ObjectProxy.ts";

//
export const bindCtx = (gt: any, ref: any|null = null)=>{
    if (typeof gt == "function" && typeof gt?.bind == "function" && (typeof ref == "object" || typeof ref == "function")) {
        // may be organic or context detached
        return gt?.bind?.(ref) ?? gt;
    }
    return gt;
}

//
export const isPromise = (target: unknown|Promise<unknown>)=>{
    return target instanceof Promise || (target as any)?.then != null && typeof (target as any)?.then == "function";
}

//
export const doOnlyAfterResolve = (meta: unknown|Promise<unknown>, cb: (u: unknown|any)=>unknown): unknown => {
    if (isPromise(meta)) {
        return (meta as any)?.then?.(cb)?.catch?.(console.error.bind(console)) ?? cb(meta);
    }
    if (meta instanceof SharedChannel) {
        return doOnlyAfterResolve(meta?.waitAuto?.(), cb);
    }
    return cb(meta);
}

//
export const wrapWeakMap = new WeakMap([]);
export const wrapMeta = (meta: unknown, handler: UniversalHandler | DataHandler | RemoteReferenceHandler | null = null)=>{
    if (!(typeof meta == "object" || typeof meta == "function")) return meta;

    //
    const wrap = (!(meta as any)?.[$data]) ? (new Proxy(MakeReference(meta), new ObjectProxy(handler || new UniversalHandler()))) : meta;
    doOnlyAfterResolve(meta, ($m)=>{
        if ($m) { doOnlyAfterResolve(wrap, (w)=>{
            if (w != null && (typeof w == "object" || typeof w == "function")) {
                const organic = wrapWeakMap.get(w) ?? w;
                const pt = organic?.[$data] ?? organic;
                if (pt?.["@uuid"]||pt?.["@type"]) { wrapWeakMap.set(w, pt); };
            }
        }); };
    });
    return wrap;
}

//
export const prepare = (w: unknown): any => {
    return doOnlyAfterResolve(w, (wrap: any)=>{
        if (wrap?.[$data]) return wrap?.[$data];
        const organic = wrapWeakMap.get(wrap) ?? wrap;
        return organic?.[$data] ?? organic;
    });
}

//
export const redirect = (w: unknown): any =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.["@uuid"]||pt?.["@type"]) as string|null)?pt:null;
    });
}

//
export const extract = (w: unknown): any =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.["@uuid"]||pt?.["@type"] as string|null))?pt:null;
    });
}
