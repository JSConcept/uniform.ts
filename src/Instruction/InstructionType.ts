// deno-lint-ignore-file ban-types no-explicit-any no-explicit-any ban-types no-explicit-any no-explicit-any
import SharedChannel from "../Utils/SharedChannel.ts";

//
export type dT = object | Function;
export type rT = WeakRef<dT>;

//
export enum $ORG {
    type = "!#type#!",
    uuid = "!#uuid#!",
    node = "!#node#!",
    payload = "!#payload#!",
    index = "!#index#!",
    exchanger = "!#exchanger#!"
}

// 
export const ORG = {
    sync: Symbol("@sync"),
    data: Symbol("@data"),
    exchanger: $ORG.exchanger,//Symbol("@exchanger"),
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}

//
export type MPromise<T extends unknown> = Promise<T>|T|null;
export type IWrap<T extends unknown> = {
    [pT in keyof T]: MPromise<pT>|IWrap<pT>;
};

//
export interface IMeta {
    [$ORG.uuid]?: string;
    [$ORG.type]?: string;
    [$ORG.node]?: unknown;
    [$ORG.payload]?: unknown;
    [$ORG.index]?: number;
};

//
export const UUIDv4 = () => {
    return (crypto?.randomUUID ? crypto?.randomUUID() : ("10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))));
};

//
export const MakeReference = (data: any = null): Function|object => {
    // not ordinal not acceptable
    if (data == null || (typeof data != "function" && typeof data != "object")) {
        return data;
    }

    // already is functional, skip it
    if (typeof data == "function" && data?.[ORG.data]) { return data; }

    // make function or class compatible for proxy
    const fx = function(this: any) { if (this != null) { this[ORG.data] = data; }; }
    if (fx != null) {
        fx.prototype.stringify = function (){ return JSON.stringify(this[ORG.data] || "{}"); }
        fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }

        // @ts-ignore "typescript not supports Symbol"
        fx[ORG.data] = data;
    }

    //
    return fx;
}

// any meta contains, and can't to be primitive or array directly
// only constructor, function, or object

/*
 * Internal types of meta
 * ["@meta"|"@data"]: {
 *   !type: string, // interpretation type (how will resolved)
 *   !uuid: string, // located in remote storage pool
 *   !payload: any, // additional descriptions
 *   !index: number // located in transferable list
 * }
 */

//
export default ORG;

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
        const chain = (meta as any)?.then?.(cb)?.catch?.(console.trace.bind(console)) ?? cb(meta as T);
        //console.trace(chain);
        return chain;
    }
    if (meta instanceof SharedChannel) {
        return doOnlyAfterResolve((meta as SharedChannel<T>)?.waitAuto?.() as T, cb);
    }
    return cb(meta as T);
}

//
export const wrapWeakMap = new WeakMap([]);
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

//
import * as _ from "../Utils/SharedChannelImpl.ts";
