// deno-lint-ignore-file no-explicit-any
import ObjectProxy from "../ObjectProxy.ts";

//
import { isSymbol, FORBIDDEN_KEYS, META_KEYS, isPromise, doOnlyAfterResolve, type IWrap } from "../Utils/Useful.ts"
import { bindCtx, MakeReference } from "../Utils/InstructionType.ts";
import ORG from "../Utils/OrganicType.ts";

//
import DataHandler from "./DataHandler.ts";


export default class PromiseHandler extends DataHandler {
    constructor() { super(); }

    //
    /*@__MANGLE_PROP__*/ $data(target: unknown|Promise<unknown>) {
        return (isPromise((target as any)?.[ORG.data]) ? (target as any)?.[ORG.data] : target) ?? target;
    }

    //
    /*@__MANGLE_PROP__*/ $deferOp(target: unknown|Promise<unknown>, cb = (e: any)=>e) {
        return doOnlyAfterResolve(target, cb) ?? target;
    }

    //
    /*@__MANGLE_PROP__*/ $wrapPromise<T extends unknown>(result: T|Promise<T>, handler: DataHandler|null = null): IWrap<T>|null {
        return $wrapPromise(result, handler ?? this);
    }

    //
    /*@__MANGLE_PROP__*/$hnd(cmd: string, meta: unknown, ...args: unknown[]) {
        // isn't promise itself
        const data = this.$data(meta);

        //
        if (cmd == "get") {
            if (args[0] == ORG.data) { return data; };
            if (args[0] == ORG.exc) { return this.$exc ?? data?.[ORG.exc] ?? data?.then?.((e: any)=>e?.[ORG.exc]) ?? null; };

            //
            if (["then", "catch", "finally"].indexOf((args as any[])?.[0]) >= 0) {
                // @ts-ignore "no idea"
                return bindCtx(Reflect?.[cmd]?.(data, ...args), data);
            }

            //
            if ( // forbidden actions
                isSymbol(args?.[0]) ||
                FORBIDDEN_KEYS.has(args?.[0] as string) || 
                META_KEYS.has?.(args?.[0] as any)
            ) { return null; };
        }

        // primitive value or non-object/function
        if (data == null || (typeof data != "object" && typeof data != "function")) { return data; };

        // unwrap first-level promise
        return this.$wrapPromise(this.$deferOp(data, (raw)=> {
            return super.$hnd(cmd, raw, ...args);
        }));
    }

    //
    /*@__MANGLE_PROP__*/$get(_uuid: unknown|string|null): any { return null; };
}

//
/*@__PURE__*/
export const /*@__MANGLE_PROP__*/ $wrapPromise = <T extends unknown>(result: T|Promise<T>, handler: DataHandler = new PromiseHandler()): IWrap<T>|null => {
    if (isPromise(result)) {
        return new Proxy(MakeReference(result), new ObjectProxy(handler)) as IWrap<T>|null;
    }
    return result as IWrap<T>;
}
