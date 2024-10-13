// deno-lint-ignore-file no-explicit-any
/*@__PURE__*/ import ObjectProxy from "../ObjectProxy.ts";

//
/*@__PURE__*/ import { isSymbol, FORBIDDEN_KEYS, META_KEYS, isPromise, doOnlyAfterResolve, type IWrap } from "../Utils/Useful.ts"
/*@__PURE__*/ import { bindCtx, MakeReference } from "../Utils/InstructionType.ts";
/*@__PURE__*/ import ORG from "../Utils/OrganicType.ts";

//
/*@__PURE__*/ import DataHandler from "./DataHandler.ts";

/*@__PURE__*/ 
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
        return $wrapPromise(result, handler ?? this);
    }

    //
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        // isn't promise itself
        const data = this.$data(meta);

        //
        if (cmd == "get") {
            if (args[0] == ORG.data) { return data; };
            if (args[0] == ORG.exchanger) { return this.$exChanger ?? data?.[ORG.exchanger] ?? data?.then?.((e: any)=>e?.[ORG.exchanger]) ?? null; };

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
            return super.$handle(cmd, raw, ...args);
        }));
    }

    //
    $get(_uuid: unknown|string|null): any { return null; };
}

//
export const $wrapPromise = <T extends unknown>(result: T|Promise<T>, handler: DataHandler = new PromiseHandler()): IWrap<T>|null => {
    if (isPromise(result)) {
        return new Proxy(MakeReference(result), new ObjectProxy(handler)) as IWrap<T>|null;
    }
    return result as IWrap<T>;
}
