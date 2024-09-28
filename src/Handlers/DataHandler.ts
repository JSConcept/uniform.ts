import ObjectProxy from "../Instruction/ObjectProxy";
import {$data} from "../Instruction/InstructionType.ts"
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
        //
        if (cmd == "get" && ["then", "catch", "finally"].indexOf(args[0]) >= 0) {
            const ref = this.$data(meta);
            const gt = Reflect?.[cmd]?.(ref, ...args);
            if (typeof gt == "function" && typeof gt?.bind == "function") {
                // may be organic or context detached
                return gt?.bind?.(ref) ?? gt;
            }
            if (gt != null) {  return gt; }
        }

        //
        return this.$unwrap(meta, (ref)=>{
            /*if (extract(ref)?.["@uuid"]) {
                console.warn("Wrong type passed, probably organic...");
                return null;
            }*/

            // any illegal is illegal (after 'then' or defer operation)...
            if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

            // needs to return itself
            if (cmd == "access") { return ref; }
            try {
                const gt = Reflect?.[cmd]?.(ref, ...args);
                if (typeof gt == "function" && typeof gt?.bind == "function") {
                    // may be organic or context detached
                    return gt?.bind?.(ref) ?? gt;
                }
                if (gt != null) { return gt; }
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
