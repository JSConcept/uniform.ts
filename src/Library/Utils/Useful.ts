// deno-lint-ignore-file no-explicit-any ban-types
import ORG, { $bindings$ } from "./OrganicType.ts";

//
export const UUIDv4 = () => {
    return (crypto?.randomUUID ? crypto?.randomUUID() : ("10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))));
};

//
export type dT = object | Function;
export type rT = WeakRef<dT>;

//
export type MPromise<T extends unknown> = Promise<T>|T|null;
export type IWrap<T extends unknown> = {
    [pT in keyof T]: MPromise<pT>|IWrap<pT>;
};

//
export type ExChanger = any;

/*
 * Internal types of meta
 * ["@meta"|"@data"]: {
 *   !type: string, // interpretation type (how will resolved)
 *   !uuid: string, // located in remote storage pool
 *   !payload: any, // additional descriptions
 *   !index: number // located in transferable list
 * }
 */

// If someone not in list, will just copy or sharing
// @ts-ignore "Transferable list for web workers (automatic)"
export const Transferable = [
    /* @ts-ignore "" */ typeof ArrayBuffer               != "undefined" ? ArrayBuffer               : null,
    /* @ts-ignore "" */ typeof MessagePort               != "undefined" ? MessagePort               : null,
    /* @ts-ignore "" */ typeof ReadableStream            != "undefined" ? ReadableStream            : null,
    /* @ts-ignore "" */ typeof WritableStream            != "undefined" ? WritableStream            : null,
    /* @ts-ignore "" */ typeof TransformStream           != "undefined" ? TransformStream           : null,
    /* @ts-ignore "" */ typeof WebTransportReceiveStream != "undefined" ? WebTransportReceiveStream : null,
    /* @ts-ignore "" */ typeof WebTransportSendStream    != "undefined" ? WebTransportSendStream    : null,
    /* @ts-ignore "" */ typeof AudioData                 != "undefined" ? AudioData                 : null,
    /* @ts-ignore "" */ typeof ImageBitmap               != "undefined" ? ImageBitmap               : null,
    /* @ts-ignore "" */ typeof VideoFrame                != "undefined" ? VideoFrame                : null,
    /* @ts-ignore "" */ typeof OffscreenCanvas           != "undefined" ? OffscreenCanvas           : null,
    /* @ts-ignore "" */ typeof RTCDataChannel            != "undefined" ? RTCDataChannel            : null
].filter((E)=>(E!=null));

//
export const isSymbol = (sym: unknown)=>(typeof sym ==='symbol' || typeof sym == 'object' && Object.prototype.toString.call(sym) == '[object Symbol]');
export const FORBIDDEN_KEYS = new Set(["bind", "toString", "then", "catch", "finally"]);
export const META_KEYS = new Set(Array.from(Object.values(ORG)));

//
const wrapExChanger = (exChanger: ExChanger|null): any => {
    if (!exChanger) return null;

    //
    return new Proxy(exChanger, {
        get(target: ExChanger, prop: any): any {
            if (prop == ORG.sync) { return target.sync; };
            if (prop == ORG.exchanger) { return target; };
            if ( // forbidden actions
                isSymbol(prop) ||
                FORBIDDEN_KEYS.has(prop as string) || 
                META_KEYS?.has?.(prop as any)
            ) { return null; };
            return target?.access?.(prop);
        },
        set(target: ExChanger, prop: string, value: any): any {
            return target?.register?.(value, prop);
        }
    });
}

//
export const isPromise = <T extends object|Function|unknown>(target: T|Promise<T>): boolean =>{
    return target instanceof Promise || (target as any)?.then != null && typeof (target as any)?.then == "function";
}

//
export const doOnlyAfterResolve = <T extends unknown|any>(meta: MPromise<T>, cb: (u: T)=>MPromise<T>|null|void): MPromise<any>|null|void => {
    if (isPromise(meta)) {
        const chain = (meta as any)?.then?.(cb)?.catch?.(console.trace.bind(console)) ?? cb(meta as T);
        //console.trace(chain);
        return chain;
    }
    return cb(meta as T);
}

//
export const getContext = (wModule: any)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        return wrapExChanger(mx?.[ORG.exchanger] ?? $bindings$?.get?.(mx));
    });
}

//
export const doTransfer = (wModule: any, name: any, node: any|null = null)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exchanger] ?? $bindings$?.get?.(mx);
        return exChanger?.doTransfer?.(name, node);
    });
}

//
export const transfer = (wModule: any, node: any|null = null, name: any = "")=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exchanger] ?? $bindings$?.get?.(mx);
        return exChanger?.transfer?.(node, name);
    });
}

export { ORG };
