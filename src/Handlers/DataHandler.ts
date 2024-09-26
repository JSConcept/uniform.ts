import ObjectProxy from "../Instruction/ObjectProxy";
import {$data} from "../Instruction/InstructionType.ts"

//
export default class DataHandler {
    constructor() {
    }

    //
    $data(target) {
        return (target[$data] ?? target);
    }

    //
    $deferOp(target, cb = (e)=>e) {
        if (target?.then != null && target?.then == "function" || target instanceof Promise) {
            return new Proxy(target?.then?.(cb), new ObjectProxy(this));
        }
        return cb(target);
    }

    //
    $unwrap(m, cb = (e)=>e) {
        return this.$deferOp(m, (e)=>this.$deferOp(this.$data(e), cb));
    }

    //
    $handle(cmd, meta, ...args) {
        return this.$unwrap(meta, (ref)=>{
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
    $get(uuid): any { return null; };
}
