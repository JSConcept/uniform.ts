import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

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
    $handle(name = "access", target, ...args) {
        return this.$deferOp(target, (t: any)=>{
            return this.#dataHandler?.get($detectDataType(t, this.#dataHandler))?.$handle?.(name, t, args);
        });
    }
}

//
export const wrapMetaHandle = (meta, handler: UniversalHandler)=>{
    return new Proxy(meta, new ObjectProxy(handler))
}
