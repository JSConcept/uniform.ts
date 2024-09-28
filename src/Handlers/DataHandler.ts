import ObjectProxy from "../Instruction/ObjectProxy";
import {$data, MakeReference} from "../Instruction/InstructionType.ts"
import { extract } from "./UniversalHandler";

//
const isPromise = (target)=>{
    return target?.then != null && typeof target?.then == "function" || target instanceof Promise;
}

//
export default class DataHandler {
    constructor() {
    }

    //
    $data(target) {
        return (isPromise(target?.[$data]) ? target?.[$data] : target) ?? target;
    }

    //
    $deferOp(target, cb = (e)=>e) {
        if (isPromise(target)) {
            return (target?.then?.(cb) ?? cb(target) ?? target);
        }
        return cb(target) ?? target;
    }

    //
    $wrapPromise(result) {
        if (isPromise(result)) {
            return new Proxy(MakeReference(result), new ObjectProxy(this));
        }
        return result;
    }

    //
    $handle(cmd, meta, ...args) {
        const data = this.$data(meta);

        //
        if (cmd == "get" && ["then", "catch", "finally", $data].indexOf(args[0]) >= 0) {
            const gt = Reflect?.[cmd]?.(data, ...args);
            if (cmd == "get" && typeof gt == "function" && typeof gt?.bind == "function") {
                // may be organic or context detached
                return gt?.bind?.(data) ?? gt;
            }
            if (gt != null) { return gt; }
        }

        //
        return this.$wrapPromise(this.$deferOp(data, (ref)=> {
            // any illegal is illegal (after 'then' or defer operation)...
            if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

            // needs to return itself
            if (cmd == "access") { return ref; }
            try {
                const gt = Reflect?.[cmd]?.(ref, ...args);
                if (gt != null) { return gt; }
            } catch(e) {
                const err = e as Error;
                console.error("Wrong op: " + err.message);
                console.trace(err);
            }
            return null;
        }));
    }

    //
    $get(uuid): any { return null; };
}
