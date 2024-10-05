import DataHandler from "../Handlers/DataHandler.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import { $data, MakeReference } from "./InstructionType.ts";
import ObjectProxy from "./ObjectProxy.ts";

//
export const isPromise = (target)=>{
    return target?.then != null && typeof target?.then == "function" || target instanceof Promise;
}

//
export const doOnlyAfterResolve = (meta, cb)=>{
    if (isPromise(meta)) {
        return meta?.then(cb) ?? cb(meta);
    }
    return cb(meta);
}

//
export const wrapWeakMap = new WeakMap([]);
export const wrapMeta = (meta, handler: UniversalHandler | DataHandler | RemoteReferenceHandler = new UniversalHandler())=>{
    //
    const wrap = (!meta?.[$data]) ? (new Proxy(MakeReference(meta), new ObjectProxy(handler))) : meta;

    //
    doOnlyAfterResolve(meta, ($m)=>{
        const m = extract($m);
        if (m) { doOnlyAfterResolve(wrap, (w)=>{
            if (w != null && (typeof w == "object" || typeof w == "function")) {
                wrapWeakMap.set(w, m);
            }
        }); };
    });

    //
    return wrap;
}

//
export const prepare = (w)=>{
    return doOnlyAfterResolve(w, (wrap)=>{
        if (wrap?.[$data]) return wrap?.[$data];
        const organic = wrapWeakMap.get(wrap) ?? wrap;
        return organic?.[$data] ?? organic;
    });
}

//
export const redirect = (w)=>{
    return doOnlyAfterResolve(w, (wrap)=>{
        const pt = prepare(wrap);
        return (pt?.["@uuid"]||pt?.["@type"])?pt:null;
    });
}

//
export const extract = (w)=>{
    return doOnlyAfterResolve(w, (wrap)=>{
        const pt = prepare(wrap);
        return (pt?.["@uuid"]||pt?.["@type"])?pt:null;
    });
}
