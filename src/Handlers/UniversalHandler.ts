import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";
import { MakeReference } from "../Instruction/InstructionType.ts";
import type RemoteReferenceHandler from "./RemotePool";
import { $data } from "../Instruction/InstructionType.ts";

//
// $detectDataType has types:
// local (memory pool)
// remote (reference)
const $detectDataType = (t: any, pool: any | null): string => {
    if (pool?.$get(t?.["@uuid"])) return "local";
    return "remote";
}

//
export default class UniversalHandler extends DataHandler {
    #dataHandler: Map<string, DataHandler>;

    //
    constructor(dataHandler: Map<string, DataHandler> = new Map<string, DataHandler>()) {
        super();
        this.#dataHandler = dataHandler;
    }

    //
    $addHandler(name: string, handler: DataHandler) {
        this.#dataHandler.set(name, handler);
    }

    //
    $getHandler(name: string) {
        return this.#dataHandler.get(name);
    }

    //
    $handle(cmd = "access", meta, ...args) {
        return this.$unwrap(meta, (t)=>{
            const local = this.$get(t);
            const tp    = (local && (typeof local != "string")) ? "local" : (typeof t?.["@uuid"] == "string" ? "remote" : "promise");
            return this.#dataHandler?.get(tp)?.$handle?.(cmd, t, ...args);
        });
    }

    //
    $get(uuid) { return this.#dataHandler.get("local")?.$get(uuid["@uuid"] ?? uuid); };
}

//
export const wrapWeakMap = new WeakMap([]);

//
const doOnlyAfterResolve = (meta, cb)=>{
    if (typeof meta?.then == "function" || meta instanceof Promise) {
        return meta?.then(cb);
    }
    return cb(meta);
}

//
export const wrapMeta = (meta, handler: UniversalHandler | DataHandler | RemoteReferenceHandler = new UniversalHandler())=>{
    //
    const wrap = new Proxy(MakeReference(meta), new ObjectProxy(handler));
    doOnlyAfterResolve(meta, (m)=>{
        doOnlyAfterResolve(wrap, (w)=>{
            wrapWeakMap.set(w, m);
        });
    });

    //
    return wrap;
}

//
export const redirect = (wrap)=>{
    if (wrap?.[$data]) return wrap?.[$data];
    const organic = wrapWeakMap.get(wrap);
    return organic?.[$data] ?? organic;
}

//
export const extract = (wrap)=>{
    if (wrap?.[$data]) return wrap?.[$data];
    const organic = wrapWeakMap.get(wrap);
    return organic?.[$data] ?? organic;
}
