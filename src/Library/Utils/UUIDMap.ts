// deno-lint-ignore-file no-explicit-any
import { UUIDv4, type dT, type rT } from "./Useful.ts";

/*@__MANGLE_PROP__*/ const timers = /*@__MANGLE_PROP__*/ new WeakMap(), tmpSet = new Set();
export const hold = (tmp: any | unknown | WeakRef<any>, timeout = 1000)=>{

    // holding from GC
    if (typeof tmp == "object" || typeof tmp == "function") {
        const obj = tmp?.deref?.() ?? tmp;
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
    return tmp?.deref?.() ?? tmp;
}

// TODO: planned promised...
export default class UUIDMap<T=dT> {
     #weakMap  =  /*@__MANGLE_PROP__*/ new WeakMap<dT, string>();
     #registry =  /*@__MANGLE_PROP__*/ new FinalizationRegistry<string>((_: string) => {});
     #refMap   =  /*@__MANGLE_PROP__*/ new Map<string, rT>();

    //
    constructor() {
         this.#weakMap  =  /*@__MANGLE_PROP__*/ new WeakMap<dT, string>();
         this.#refMap   =  /*@__MANGLE_PROP__*/ new Map<string, rT>();
         this.#registry =  /*@__MANGLE_PROP__*/ new FinalizationRegistry<string>((key: string) => {
            this.#refMap.delete(key);
        });
    }

    // when transfer out required
    delete<R extends dT | string>(key: R): unknown {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.delete(<dT>(<unknown>key));
        }
        return this.#refMap.delete(<string>(<unknown>key));
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
        this.#refMap.set(id, /*@__MANGLE_PROP__*/ new WeakRef<dT>(  hold(obj, 1000)  ));
        this.#registry.register(obj, id);

        //
        return id;
    }

    //
    get<R extends dT | string>(key: R): unknown {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.get(<dT>(<unknown>key));
        }
        return hold(this.#refMap.get(<string>(<unknown>key)));
    }
}
