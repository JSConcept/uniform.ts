import ObjectProxy from "../Instruction/ObjectProxy";

//
export default class DataHandler {
    constructor() {
    }

    //
    $deferOp(target, cb) {
        if (target?.then != null) {
            return new Proxy(target?.then?.(cb), new ObjectProxy(this));
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

            // needs to return itself
            if (cmd == "access") { return ref; }
            try {
                const gt = Reflect?.[cmd]?.(ref, ...args);
                if (typeof gt == "function") {
                    // may be organic or context detached
                    return gt?.bind?.(ref) ?? gt;
                }
            } catch(e) {
                const err = e as Error;
                console.error("Wrong op: " + err.message);
                console.trace(err);
            }
            return null;
        });
    }

    //
    $get(uuid) { return null; };
}
