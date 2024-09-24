import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPoolHandler: any;

    //
    constructor(memoryPoolHandler){
        super();
        this.#memoryPoolHandler = memoryPoolHandler;
    }

    //
    #data(target) {
        return this.$deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            return wrap?.["@uuid"] ? this.#memoryPoolHandler.get(wrap?.["@uuid"])?.defer?.() : null;
        });
    }

    //
    $handle(cmd, ref, ...args) {
        return this.$deferOp(ref, (data)=>{
            const ref = this.#data(data);
            /*switch(cmd) {
                switch("get") {
                }
                default:
            }*/
            if (cmd == "access") return ref;
            return Reflect[cmd](ref, ...args);
        });
    }
}

//
export const wrapLocalReference = (localReference, handler: ObjectPoolMemberHandler)=>{
    return new Proxy(localReference, new ObjectProxy(handler))
}
