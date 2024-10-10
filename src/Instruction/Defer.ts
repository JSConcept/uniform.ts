// deno-lint-ignore-file no-explicit-any ban-types
import DataHandler from "../Handlers/DataHandler.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import SharedChannel from "../Utils/SharedChannel.ts";
import { MakeReference } from "./InstructionType.ts";
import ObjectProxy, { IMeta, IWrap, MPromise } from "./ObjectProxy.ts";
import ORG from "../Instruction/InstructionType.ts";

//
export const bindCtx = (gt: any, ref: any|null = null)=>{
    if (typeof gt == "function" && typeof gt?.bind == "function" && (typeof ref == "object" || typeof ref == "function")) {
        // may be organic or context detached
        return gt?.bind?.(ref) ?? gt;
    }
    return gt;
}

//
export const isPromise = <T extends object|Function|unknown>(target: T|Promise<T>): boolean =>{
    return target instanceof Promise || (target as any)?.then != null && typeof (target as any)?.then == "function";
}

//
export const doOnlyAfterResolve = <T extends unknown|any>(meta: MPromise<T>, cb: (u: T)=>MPromise<T>|null|void): MPromise<any>|null|void => {
    if (isPromise(meta)) {
        return (meta as any)?.then?.(cb)?.catch?.(console.warn.bind(console)) ?? cb(meta as T);
    }
    if (meta instanceof SharedChannel) {
        return doOnlyAfterResolve((meta as SharedChannel<T>)?.waitAuto?.() as T, cb);
    }
    return cb(meta as T);
}

//
export const wrapWeakMap = new WeakMap([]);
export const wrapMeta = <T extends IMeta|unknown>(meta: MPromise<T>|IWrap<T>|null, handler: UniversalHandler | DataHandler | RemoteReferenceHandler | null = null)=>{
    if (!(typeof meta == "object" || typeof meta == "function")) return meta;

    //
    const wrap = (!(meta as any)?.[ORG.data]) ? (new Proxy(MakeReference(meta), new ObjectProxy(handler || new UniversalHandler()))) : meta;
    doOnlyAfterResolve<IMeta>(meta as MPromise<IMeta>, ($m: IMeta) => {
        if ($m) { doOnlyAfterResolve(wrap, (w)=>{
            if (w != null && (typeof w == "object" || typeof w == "function")) {
                const organic = (wrapWeakMap.get(w) ?? w) as any;
                const pt = organic?.[ORG.data] ?? organic;
                if (pt?.[ORG.uuid]||pt?.[ORG.type]) { wrapWeakMap.set(w, pt); };
            }
        }); };
    });
    return wrap;
}

//
export const prepare = <T extends unknown>(w: IWrap<T>|T|IMeta): any => {
    return doOnlyAfterResolve(w, (wrap: any)=>{
        if (wrap?.[ORG.data]) return wrap?.[ORG.data];
        const organic = wrapWeakMap.get(wrap) ?? wrap;
        return organic?.[ORG.data] ?? organic;
    });
}

//
export const redirect = <T extends unknown>(w: IWrap<T>|MPromise<T>|MPromise<IMeta>): MPromise<IMeta> =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.[ORG.uuid]||pt?.[ORG.type]) as string|null)?pt:null;
    });
}

//
export const extract = <T extends unknown>(w: IWrap<T>|MPromise<T>|MPromise<IMeta>): MPromise<IMeta> =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.[ORG.uuid]||pt?.[ORG.type] as string|null))?pt:null;
    });
}
