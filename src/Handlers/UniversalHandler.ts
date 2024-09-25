import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";
import { MakeReference } from "../Instruction/InstructionType.ts";

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
    $handle(name = "access", target, ...args) {
        return this.$deferOp(target, (t: any)=>{
            return this.#dataHandler?.get($detectDataType(t, this.#dataHandler))?.$handle?.(name, t, args);
        });
    }
}

//
const wrapWeakMap = new WeakMap([]);

//
export const wrapMeta = (meta, handler: UniversalHandler = new UniversalHandler())=>{
    const wrap = new Proxy(MakeReference(meta), new ObjectProxy(handler));
    wrapWeakMap.set(wrap, meta);
    return wrap;
}

//
export const redirect = (wrap)=>{
    return (wrapWeakMap.get(wrap) ?? wrap);
}

//
export const extract = (wrap)=>{
    return (wrapWeakMap.get(wrap) ?? wrap);
}
