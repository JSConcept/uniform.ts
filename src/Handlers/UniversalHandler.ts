import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";
import { MakeReference } from "../Instruction/InstructionType.ts";
import type RemoteReferenceHandler from "./RemotePool";
import { $data } from "../Instruction/InstructionType.ts";

//
export default class UniversalHandler extends DataHandler {
    #dataHandler: Map<string, DataHandler>;

    //
    constructor(dataHandler: Map<string, DataHandler> = new Map<string, DataHandler>()) {
        super();
        this.#dataHandler = dataHandler;
    }

    //
    $addHandler(name: string, handler: DataHandler) { this.#dataHandler.set(name, handler); }
    $getHandler(name: string) { return this.#dataHandler.get(name); }

    //
    $handle(cmd = "access", t, ...args) {
        const meta  = extract(t);
        const local = this.$get(meta);
        const tp    = (local && (typeof local != "string") && (extract(local)?.["@uuid"] != meta?.["@uuid"])) ? "local" : (typeof meta?.["@uuid"] == "string" ? "remote" : "promise");
        return this.#dataHandler?.get(tp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}

//
export const wrapWeakMap = new WeakMap([]);
export const doOnlyAfterResolve = (meta, cb)=>{
    if (typeof meta?.then == "function" || meta instanceof Promise) {
        return meta?.then(cb);
    }
    return cb(meta);
}

//
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
