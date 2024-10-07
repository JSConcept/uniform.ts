// deno-lint-ignore-file no-explicit-any
import ObjectProxy from "../Instruction/ObjectProxy.ts";
import { $data, MakeReference} from "../Instruction/InstructionType.ts"
import { isPromise } from "../Instruction/Defer.ts";
import DataHandler from "./DataHandler.ts";

//
export const bindCtx = (gt: any, ref: any|null = null)=>{
    if (typeof gt == "function" && typeof gt?.bind == "function" && (typeof ref == "object" || typeof ref == "function")) {
        // may be organic or context detached
        return gt?.bind?.(ref) ?? gt;
    }
    return gt;
}

//
export default class PromiseHandler extends DataHandler {
    constructor() { super(); }

    //
    $data(target: unknown|Promise<unknown>) {
        return (isPromise(target?.[$data]) ? target?.[$data] : target) ?? target;
    }

    //
    $deferOp(target: unknown|Promise<unknown>, cb = (e: any)=>e) {
        if (isPromise(target)) {
            return (target?.then?.(cb) ?? cb(target) ?? target);
        }
        return cb(target) ?? target;
    }

    //
    $wrapPromise(result: unknown|Promise<unknown>, handler: DataHandler|null = null) {
        if (isPromise(result)) {
            return new Proxy(MakeReference(result), new ObjectProxy(handler ?? this));
        }
        return result;
    }

    //
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        //
        const data = this.$data(meta);
        if (cmd == "get" && ["then", "catch", "finally", $data].indexOf(args?.[0]) >= 0) {
            if (args[0] == $data) { return this.$wrapPromise(data); }
            if (data == null || (typeof data != "object" && typeof data != "function")) { return data; };
            return bindCtx(Reflect?.[cmd]?.(data, ...args), data);
        }

        // unwrap first-level promise
        return this.$wrapPromise(this.$deferOp(data, (raw)=> {
            return super.$handle(cmd, raw, ...args);
        }));
    }

    //
    $get(_uuid: unknown|string|null): any { return null; };
}
