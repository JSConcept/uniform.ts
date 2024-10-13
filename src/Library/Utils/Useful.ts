// deno-lint-ignore-file no-explicit-any ban-types
 import PMS from "./Alias.ts";
 import ORG, { $bindings$ } from "./OrganicType.ts";


export const UUIDv4 = () => {
    return (crypto?.randomUUID ? crypto?.randomUUID() : ("10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))));
};

export type dT = object | Function;
export type rT = /*@__MANGLE_PROP__*/ WeakRef<dT>;
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
/*@__MANGLE_PROP__*/
export const Transferable = [
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof ArrayBuffer               != "undefined" ? ArrayBuffer               : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof MessagePort               != "undefined" ? MessagePort               : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof ReadableStream            != "undefined" ? ReadableStream            : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof WritableStream            != "undefined" ? WritableStream            : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof TransformStream           != "undefined" ? TransformStream           : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof WebTransportReceiveStream != "undefined" ? WebTransportReceiveStream : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof WebTransportSendStream    != "undefined" ? WebTransportSendStream    : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof AudioData                 != "undefined" ? AudioData                 : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof ImageBitmap               != "undefined" ? ImageBitmap               : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof VideoFrame                != "undefined" ? VideoFrame                : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof OffscreenCanvas           != "undefined" ? OffscreenCanvas           : null,
    /* @ts-ignore "" */ /*@__MANGLE_PROP__*/ typeof RTCDataChannel            != "undefined" ? RTCDataChannel            : null
].filter((E)=>(E!=null));

    //
    /*@__MANGLE_PROP__*/ export const isSymbol = (sym: unknown)=>(typeof sym ==='symbol' || typeof sym == 'object' && Object.prototype.toString.call(sym) == '[object Symbol]');
    /*@__MANGLE_PROP__*/ export const FORBIDDEN_KEYS = new Set(["bind", "toString", "then", "catch", "finally"]);
    /*@__MANGLE_PROP__*/ export const META_KEYS = new Set(Array.from(Object.values(ORG)));
    /*@__MANGLE_PROP__*/ export const wrapExChanger = (exChanger: ExChanger|null): any => {
        if (!exChanger) return null;

        //
        return new Proxy(exChanger, {
            get(target: ExChanger, prop: any): any {
                if (prop == ORG.sync) { return target.sync; };
                if (prop == ORG.exc) { return target; };
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

/*@__MANGLE_PROP__*/ export const isPromise = <T extends object|Function|unknown>(target: T|Promise<T>): boolean =>{
    return target instanceof PMS || (target as any)?.then != null && typeof (target as any)?.then == "function";
}

/*@__MANGLE_PROP__*/ export const doOnlyAfterResolve = <T extends unknown|any>(meta: MPromise<T>, cb: (u: T)=>MPromise<T>|null|void): MPromise<any>|null|void => {
    if (isPromise(meta)) {
        const chain = (meta as any)?.then?.(cb)?.catch?.(console.trace.bind(console)) ?? cb(meta as T);
        //console.trace(chain);
        return chain;
    }
    return cb(meta as T);
}

export const getContext = (wModule: any)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        return wrapExChanger(mx?.[ORG.exc] ?? $bindings$?.get?.(mx) ?? mx);
    });
}

export const doTransfer = (wModule: any, name: any, node: any|null = null)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exc] ?? $bindings$?.get?.(mx) ?? mx;
        return exChanger?.doTransfer?.(name, node);
    });
}

export const transfer = (wModule: any, node: any|null = null, name: any = "")=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exc] ?? $bindings$?.get?.(mx) ?? mx;
        return exChanger?.transfer?.(node, name);
    });
}


export { ORG };
