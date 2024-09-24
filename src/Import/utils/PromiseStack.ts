import { UUIDv4 } from "./Utils.ts";

// for your web worker project...
export default class PromiseStack {
    #map = new Map<string, PromiseWithResolvers<any>>();

    //
    constructor() {
        this.#map = new Map<string, PromiseWithResolvers<any>>();
    }

    // reject by UUID
    rejectBy(name, why) {
        if (this.#map.has(name)) {
            const pm = this.#map.get(name);
            this.#map.delete(name);
            pm?.reject(why);
        }
        return this;
    }

    // resolve by UUID
    resolveBy(name, why) {
        if (this.#map.has(name)) {
            const pm = this.#map.get(name);
            this.#map.delete(name);
            pm?.resolve(why);
        }
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
