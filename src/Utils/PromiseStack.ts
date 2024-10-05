//
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};

// for your web worker project...
export default class PromiseStack {
    #map = new Map<string, PromiseWithResolvers<any>>();

    //
    constructor() {
        this.#map = new Map<string, PromiseWithResolvers<any>>();
    }

    //
    #syncExcept(ne = "") {
        return Promise.allSettled(Array.from(this.#map?.entries?.()?.filter?.(([n,v])=>(ne!=n))?.map?.((([n,v])=>v))));
    }

    //
    get sync() {
        return this.#syncExcept();
    }

    // reject by UUID
    rejectBy(name, why) {
        this.#syncExcept(name).then(()=>{
            if (this.#map.has(name)) {
                const pm = this.#map.get(name);
                this.#map.delete(name);
                pm?.reject(why);
            }
        });
        return this;
    }

    // resolve by UUID
    resolveBy(name, why) {
        this.#syncExcept(name).then(()=>{
            if (this.#map.has(name)) {
                const pm = this.#map.get(name);
                this.#map.delete(name);
                pm?.resolve(why);
            }
        });
        return this;
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
