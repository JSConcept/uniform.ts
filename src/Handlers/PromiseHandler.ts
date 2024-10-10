// deno-lint-ignore-file no-explicit-any
import ObjectProxy from "../Instruction/ObjectProxy.ts";
import ORG, { MakeReference} from "../Instruction/InstructionType.ts"
import { isPromise, bindCtx, doOnlyAfterResolve } from "../Instruction/Defer.ts";
import DataHandler from "./DataHandler.ts";
import ORG from "../Instruction/InstructionType.ts";
import { IWrap } from "../Instruction/ObjectProxy.ts";

//
export default class PromiseHandler extends DataHandler {
    constructor() { super(); }

    //
    $data(target: unknown|Promise<unknown>) {
        return (isPromise((target as any)?.[ORG.data]) ? (target as any)?.[ORG.data] : target) ?? target;
    }

    //
    $deferOp(target: unknown|Promise<unknown>, cb = (e: any)=>e) {
        return doOnlyAfterResolve(target, cb) ?? target;
    }

    //
    $wrapPromise<T extends unknown>(result: T|Promise<T>, handler: DataHandler|null = null): IWrap<T>|null {
        if (isPromise(result)) {
            return new Proxy(MakeReference(result), new ObjectProxy(handler ?? this)) as IWrap<T>|null;
        }
        return result as IWrap<T>;
    }

    //
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        //
        const data = this.$data(meta);
        if (cmd == "get" && ["then", "catch", "finally", ORG.data, ORG.exchanger].indexOf((args as any[])?.[0]) >= 0) {
            if (args[0] == ORG.data) { return this.$wrapPromise(data); }
            //if (args[0] == ORG.exchanger) { return this.#exChanger; };

            //
            if (data == null || (typeof data != "object" && typeof data != "function")) { return data; };

            // @ts-ignore "no idea"
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
