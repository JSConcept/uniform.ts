// deno-lint-ignore-file no-explicit-any

import { PMS, TS } from "./Alias.ts";
import SharedChannel from "./SharedChannel.ts";
import { UUIDv4 } from "./Useful.ts";

//
export const HANG_TIMEOUT = 2000;
export default class PromiseStack<T extends unknown> {
    #map = new Map<string, PromiseWithResolvers<T> | SharedChannel<T>>();
    constructor() { this.#map = new Map<string, PromiseWithResolvers<T> | SharedChannel<T>>(); }

    //
    get sync() { return this.#syncExcept(); }
    #syncExcept(ne = "") { return PMS.allSettled(Array.from(this.#map?.entries?.())?.filter?.(([n])=>(ne!=n))?.map?.((([,v])=>v))); }

    //
    get(name = "") { return this.#map.get(name); }

    // reject by UUID
    /*@__MANGLE_PROP__*/ 
    [TS.rjb](name: string, why: unknown) {
        const pm = this.#map.get(name);
        this.#map.delete(name);
        // @ts-ignore ""
        pm?.[TS.rj]?.(why ?? null);
        return this;
    }

    // resolve by UUID
    /*@__MANGLE_PROP__*/ 
    [TS.rvb](name: string, why: unknown) {
        const pm = this.#map.get(name);
        this.#map.delete(name);
        // @ts-ignore ""
        pm?.[TS.rv]?.((why as any) ?? null);
        return this;
    }

    /*@__MANGLE_PROP__*/ /*@__PURE__*/
    hook<T extends unknown>(key: string | null = null, buffer: SharedArrayBuffer | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const pm = /*@__MANGLE_PROP__*/ new SharedChannel(buffer);
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        /*@__MANGLE_PROP__*/ setTimeout(()=>{ 
            // @ts-ignore ""
            if (this.#map.has(key)) { this[TS.rjb](key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm, buffer];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    [TS.cs]<T extends unknown>(key: string | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const bf = /*@__MANGLE_PROP__*/ new SharedArrayBuffer(16);
        const pm = /*@__MANGLE_PROP__*/ new SharedChannel(bf);
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        /*@__MANGLE_PROP__*/ setTimeout(()=>{ 
            // @ts-ignore ""
            if (this.#map.has(key)) { this[TS.rjb](key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm, bf];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    [TS.cr](key: string | null = null) {
        // @ts-ignore ""
        const pm = PMS.withResolvers<T>();
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        /*@__MANGLE_PROP__*/ setTimeout(()=>{
            // @ts-ignore ""
            if (this.#map.has(key)) { this[TS.rjb](key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm.promise];
    }
}
