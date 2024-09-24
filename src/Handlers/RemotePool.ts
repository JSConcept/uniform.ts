import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: any;

    //
    constructor(exChanger){
        super();
        this.#exChanger = exChanger;
    }

    //
    #deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }

    //
    #data(target) {
        return this.#deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            return wrap?.["@uuid"];//wrap?.["@uuid"] ? this.#exhcnager.get(wrap?.["@uuid"])?.defer?.() : null;
        });
    }

    //
    $handle(cmd, meta, ...args) {
        //const ref = this.#data(meta);
        return this.#deferOp(meta, (data)=>{
            return this.#exChanger.$request(cmd, this.#data(data), ...args);
        });
    }
}

//
export const wrapRemoteReference = (reference, handler: RemoteReferenceHandler)=>{
    return new Proxy(reference, new ObjectProxy(handler))
}
