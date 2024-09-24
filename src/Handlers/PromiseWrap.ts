import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class PromiseWrap extends DataHandler {
    constructor() {
        super();
    }

    //
    #data(target) {
        return this.$deferOp(target, (e)=>e);
    }

    //
    $handle(cmd, meta, ...args) {
        return this.$deferOp(meta, (data)=>{
            const ref = this.#data(data);
            if (cmd == "access") return ref;
            return Reflect[cmd](ref, ...args);
        });
    }
}

//
export const wrapPromiseAccess = (promise)=>{
    return new Proxy(promise, new ObjectProxy(new PromiseWrap()))
}
