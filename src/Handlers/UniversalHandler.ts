import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
// $detectDataType has types:
// local (memory pool)
// remote (reference)
const $detectDataType = (t: any): string => {
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
        return this.#deferOp(target, (t: any)=>{
            return this.#dataHandler?.get($detectDataType(t))?.$handle?.(name, t, args);
        });
    }

    //
    #deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }
}

//
export const wrapUnhandledReference = (localReference, handler: UniversalHandler)=>{
    return new Proxy(localReference, new ObjectProxy(handler))
}
