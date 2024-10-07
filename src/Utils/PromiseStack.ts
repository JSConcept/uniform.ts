import SharedChannel from "./SharedChannel.ts";

//
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};

// for your web worker project...
export default class PromiseStack {
    #map = new Map<string, PromiseWithResolvers<any>>();
    #smp = new Map<string, SharedChannel<any>>();

    //
    constructor() {
        this.#map = new Map<string, PromiseWithResolvers<any>>();
    }

    //
    get sync() { return this.#syncExcept(); }
    #syncExcept(ne = "") { return Promise.allSettled(Array.from(this.#map?.entries?.()?.filter?.(([n,v])=>(ne!=n))?.map?.((([n,v])=>v)))); }

    //
    get(name = "") {
        return this.#smp.get(name) ?? this.#map.has(name);
    }

    // reject by UUID
    rejectBy(name, why) {
        if (this.#smp.has(name)) {
            const pm = this.#smp.get(name);
            this.#smp.delete(name);
            // unsupported?
            pm?.reject?.(why);
        }
        this.#syncExcept(name).then(()=>{
            if (this.#map.has(name)) {
                const pm = this.#map.get(name);
                this.#map.delete(name);
                pm?.reject?.(why);
            }
        });
        return this;
    }

    // resolve by UUID
    resolveBy(name, why) {
        if (this.#smp.has(name)) {
            const pm = this.#smp.get(name);
            this.#smp.delete(name);
            pm?.resolve?.(why);
        }
        this.#syncExcept(name).then(()=>{
            if (this.#map.has(name)) {
                const pm = this.#map.get(name);
                this.#map.delete(name);
                pm?.resolve?.(why);
            }
        });
        return this;
    }

    //
    hook<T extends any>(key: string | null = null, buffer: SharedArrayBuffer | ArrayBuffer | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const pm = new SharedChannel(buffer);
        this.#smp.set(key ||= UUIDv4(), pm);
        return [key, pm, buffer];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    createSync<T extends any>(key: string | null = null): [string, SharedChannel<T>, SharedArrayBuffer|ArrayBuffer|unknown] {
        const bf = new SharedArrayBuffer(16);
        const pm = new SharedChannel(bf);
        this.#smp.set(key ||= UUIDv4(), pm);
        return [key, pm, bf];
    }

    // [
    //  :0 - for sending UUID or identify
    //  :1 - for waiting or async ops
    // ]
    create(key: string | null = null) {
        const pm = Promise.withResolvers();
        this.#map.set(key ||= UUIDv4(), pm);
        return [key, pm.promise];
    }
}
