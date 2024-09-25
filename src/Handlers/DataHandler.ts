import ObjectProxy from "../Instruction/ObjectProxy.ts";

//
export default class DataHandler {
    constructor() {
    }

    //
    $deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }

    //
    $data(target) {
        return this.$deferOp(target, (e)=>e);
    }

    //
    $handle(cmd, meta, ...args) {
        return this.$deferOp(meta, (data)=>{
            const ref = this.$data(data);

            //
            if (cmd == "access") {
                return ref;
            }

            //
            try {
                return Reflect?.[cmd]?.(ref, ...args);
            } catch(e) {
                console.error("Wrong op: " + e.message);
                console.trace(e);
            }
            return null;
        });
    }

    //
    $get(uuid) { return null; };
}

//
export const wrapObject = (promise)=>{
    return new Proxy(promise, new ObjectProxy(new DataHandler()))
}
