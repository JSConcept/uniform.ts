// deno-lint-ignore-file no-explicit-any
import { UUIDv4, type dT, type rT } from "./Useful";
/*@__NOINLINE__*/ const rg = "register";

/*@__MANGLE_PROP__*/ const timers = /*@__MANGLE_PROP__*/ new WeakMap(), tmpSet = new Set();
export const hold = (tmp: any | unknown | WeakRef<any>, timeout = 1000)=>{

    // holding from GC
    /*@__MANGLE_PROP__*/
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
/*@__MANGLE_PROP__*/ /*@__PURE___*/ 
export default class UUIDMap<T=dT> {
    /*@__MANGLE_PROP__*/ #weakMap  = /*@__MANGLE_PROP__*/ new WeakMap<dT, string>();
    /*@__MANGLE_PROP__*/ #refMap   = /*@__MANGLE_PROP__*/ new Map<string, rT>();
    /*@__MANGLE_PROP__*/ #registry = /*@__MANGLE_PROP__*/ new FinalizationRegistry<string>((_: string) => {});

    //
    constructor() {
        /*@__MANGLE_PROP__*/ this.#weakMap  = /*@__MANGLE_PROP__*/ new WeakMap<dT, string>();
        /*@__MANGLE_PROP__*/ this.#refMap   = /*@__MANGLE_PROP__*/ new Map<string, rT>();
        /*@__MANGLE_PROP__*/ this.#registry = /*@__MANGLE_PROP__*/ new FinalizationRegistry<string>((key: string) => {
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
        this.#refMap.set(id, new WeakRef<dT>(  hold(obj, 1000)  ));
        this.#registry?.[rg]?.(obj, id);

        //
        return id;
    }

    //
    has<R extends dT | string>(key: R): boolean {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.has(<dT>(<unknown>key));
        }
        return hold(this.#refMap.has(<string>(<unknown>key)));
    }

    //
    get<R extends dT | string>(key: R): unknown {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.get(<dT>(<unknown>key));
        }
        return hold(this.#refMap.get(<string>(<unknown>key)));
    }
}
