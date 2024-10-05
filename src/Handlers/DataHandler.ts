import ObjectProxy from "../Instruction/ObjectProxy.ts";
import { $data, MakeReference} from "../Instruction/InstructionType.ts"
import { extract, isPromise } from "../Instruction/Defer.ts";

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
        if (isPromise(result) && !result?.[$data]) {
            return new Proxy(MakeReference(result), new ObjectProxy(this));
        }
        return result;
    }

    //
    $handle(cmd, meta, ...args) {
        //
        if (cmd == "get" && ["then", "catch", "finally", $data].indexOf(args[0]) >= 0) {
            const data = this.$data(meta);
            if (args[0] == $data) { return (data?.[$data] ?? data); }
            if (data == null || (typeof data != "object" && typeof data != "function")) { return data; }

            //
            const gt = Reflect?.[cmd]?.(data, ...args);
            if (typeof gt == "function" && typeof gt?.bind == "function") {
                // may be organic or context detached
                return gt?.bind?.(data) ?? gt;
            }
            if (gt != null) { return gt; }
        }

        // unwrap first-level promise
        return this.$wrapPromise(this.$deferOp(meta, (raw)=> {
            const data = this.$data(raw); // will get data from memory pool include
            return this.$deferOp(data, (ref)=> {
                // any illegal is illegal (after 'then' or defer operation)...
                if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

                // needs to return itself
                if (cmd == "access") { return ref; }
                if (cmd == "transfer") {
                    // sometimes, `@uuid` may already is known from memory pool
                    const wrap = extract(raw) ?? raw;
                    return {"@type": "transfer", "@node": ref, "@uuid": wrap?.["@uuid"] ?? ""}
                };
                try {
                    const gt = Reflect?.[cmd]?.(ref, ...args);
                    if (gt != null) { return gt; }
                } catch(e) {
                    const err = e as Error;
                    console.error("Wrong op: " + err.message);
                    console.trace(err);
                }
                return null;
            });
        }));
    }

    //
    $get(uuid): any { return null; };
}
