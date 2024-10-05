import ObjectProxy from "../Instruction/ObjectProxy.ts";
import { $data, MakeReference} from "../Instruction/InstructionType.ts"
import { extract, isPromise } from "../Instruction/Defer.ts";

//
export const bindCtx = (gt, ref = null)=>{
    if (typeof gt == "function" && typeof gt?.bind == "function" && (typeof ref == "object" || typeof ref == "function")) {
        // may be organic or context detached
        return gt?.bind?.(ref) ?? gt;
    }
    return gt;
}

//
export default class DataHandler {
    constructor() {
    }

    //
    $data(target) { return target; };
    $handle(cmd, meta, ...args) {
        const ref = this.$data(meta);

        // any illegal is illegal (after 'then' or defer operation)...
        if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

        // needs to return itself
        if (cmd == "access") { return ref; }
        if (cmd == "transfer") {
            // sometimes, `@uuid` may already is known from memory pool
            const wrap = extract(meta);
            return {"@type": "transfer", "@node": ref, "@uuid": wrap?.["@uuid"] ?? ""}
        };

        //
        try {
            //return bindCtx(Reflect?.[cmd]?.(ref, ...args), ref);
            return Reflect?.[cmd]?.(ref, ...args);
        } catch(e) {
            const err = e as Error;
            console.error("Wrong op: " + err.message);
            console.trace(err);
        }

        //
        return ref;
    }

    //
    $get(uuid): any { return null; };
}
