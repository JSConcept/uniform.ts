import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: any;

    //
    constructor(memoryPool){
        super();
        this.#memoryPool = memoryPool;
    }

    //
    $data(target) {
        return this.$deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            return wrap?.["@uuid"] ? this.#memoryPool.get(wrap?.["@uuid"])?.defer?.() : null;
        });
    }

    //
    $get(uuid) { return uuid ? this.#memoryPool.get(uuid)?.defer?.() : null; };
}

//
export const wrapLocal = (meta, handler: ObjectPoolMemberHandler)=>{
    return new Proxy(meta, new ObjectProxy(handler))
}
