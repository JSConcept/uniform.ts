//import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: any;

    //
    constructor(memoryPool){
        super();
        this.#memoryPool = memoryPool;
    }

    // there is may not be meta object
    $data(target) {
        return this.$deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            const weak = (wrap?.["@uuid"] ? this.#memoryPool.get(wrap?.["@uuid"]) : wrap);
            return weak?.deref?.() ?? weak;
        });
    }

    //
    $get(uuid) { return uuid ? this.#memoryPool.get(uuid)?.defer?.() : null; };
}

//
/*export const wrapLocal = (meta, handler: ObjectPoolMemberHandler)=>{
    return new Proxy(meta, new ObjectProxy(handler))
}*/
