import DataHandler from "../Handlers/DataHandler";

//
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};

//
const timers = new WeakMap();
const tmpSet = new Set();
export const hold = (obj, timeout = 1000)=>{

    // holding from GC
    if (typeof obj == "object" || typeof obj == "function") {
        if (!tmpSet.has(obj)) {
            tmpSet.add(obj);
            timers.set(obj, setTimeout(
                (obj) => { return tmpSet.delete(obj); },
                timeout,
                obj
            ));
        }
    }

    //
    return obj;
}

//
export type dT = object | Function;
export type rT = WeakRef<dT>;

// TODO! planned promised...
export default class UUIDMap<T=dT> {
    #weakMap = new WeakMap<dT, string>();
    #registry = new FinalizationRegistry<string>((_: string) => {});
    #refMap = new Map<string, rT>();

    //
    constructor() {
        this.#weakMap = new WeakMap<dT, string>();
        this.#refMap = new Map<string, rT>();
        this.#registry = new FinalizationRegistry<string>((key: string) => {
            this.#refMap.delete(key);
        });
    }

    // when transfer out required
    delete<R extends dT | string>(key: R): R {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.delete(<dT>(<unknown>key)) as any;
        }
        return this.#refMap.delete(<string>(<unknown>key)) as any;
    }

    //
    add(obj: dT, id: string = "", force = false) {
        if (!(typeof obj == "object" || typeof obj == "function")) return obj;

        // never override already added, except transfer cases
        if (id && this.#refMap.has(id) && !force) { return id; };

        //
        if (this.#weakMap.has(obj)) {
            return this.#weakMap.get(obj);
        }

        //
        this.#weakMap.set(obj, (id ||= UUIDv4()));
        this.#refMap.set(id, new WeakRef<dT>(  hold(obj, 1000)  ));
        this.#registry.register(obj, id);

        //
        return id;
    }

    //
    get<R extends dT | string>(key: R): R {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.get(<dT>(<unknown>key)) as any;
        }
        return this.#refMap.get(<string>(<unknown>key)) as any;
    }
}
