// deno-lint-ignore-file no-explicit-any

/*@__PURE__*/ 
import SharedChannel from "./SharedChannel.ts";
import { UUIDv4 } from "./Useful.ts";

//
/*@__PURE__*/ export const HANG_TIMEOUT = 2000;
export default class PromiseStack<T extends unknown> {
    /*@__PURE__*/ 
    #map = new Map<string, PromiseWithResolvers<T> | SharedChannel<T>>();

    /*@__PURE__*/ 
    constructor() { this.#map = new Map<string, PromiseWithResolvers<T> | SharedChannel<T>>(); }

    //
    /*@__PURE__*/ get sync() { return this.#syncExcept(); }
    /*@__PURE__*/ #syncExcept(ne = "") { return Promise.allSettled(Array.from(this.#map?.entries?.())?.filter?.(([n])=>(ne!=n))?.map?.((([,v])=>v))); }

    //
    get(name = "") { return this.#map.get(name); }

    // reject by UUID
    rejectBy(name: string, why: unknown) {
        const pm = this.#map.get(name);
        this.#map.delete(name);
        pm?.reject?.(why ?? null);
        return this;
    }

    // resolve by UUID
    resolveBy(name: string, why: unknown) {
        const pm = this.#map.get(name);
        this.#map.delete(name);
        pm?.resolve?.((why as any) ?? null);
        return this;
    }

    /*@__PURE__*/
    hook<T extends unknown>(key: string | null = null, buffer: SharedArrayBuffer | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const pm = new SharedChannel(buffer);
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        setTimeout(()=>{ 
            if (this.#map.has(key)) { this.rejectBy(key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm, buffer];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    /*@__PURE__*/
    createSync<T extends unknown>(key: string | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const bf = new SharedArrayBuffer(16);
        const pm = new SharedChannel(bf);
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        setTimeout(()=>{ 
            if (this.#map.has(key)) { this.rejectBy(key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm, bf];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    create(key: string | null = null) {
        const pm = Promise.withResolvers<T>();
        this.#map.set(key ||= UUIDv4(), pm);

        // timeout of requests
        setTimeout(()=>{ 
            if (this.#map.has(key)) { this.rejectBy(key, "hang-timeout"); };
        }, HANG_TIMEOUT);

        //
        return [key, pm.promise];
    }
}
