import {UUIDv4} from "./Utils.ts";

//
export type dT = object | Function;
export type rT = WeakRef<dT>;

//
export default class UUIDMap<T=dT> {
    #weakMap = new WeakMap<dT, string>();
    #registry = new FinalizationRegistry<dT>((_: string) => {});
    #refMap = new Map<string, rT>();

    //
    constructor() {
        this.#weakMap = new WeakMap<dT, string>();
        this.#refMap = new Map<string, rT>();
        this.#registry = new FinalizationRegistry<dT>((key: string) => {
            this.#refMap.delete(key);
        });
    }

    //
    add(obj: dT, id: string = "") {
        if (!(typeof obj == "object" || typeof obj == "function")) return obj;

        // never override already added
        if (id && this.#refMap.has(id)) {id = UUIDv4();}

        //
        if (this.#weakMap.has(obj)) {
            this.#weakMap.get(obj);
        }

        //
        this.#weakMap.set(obj, (id ||= UUIDv4()));
        this.#refMap.set(id, new WeakRef<dT>(obj));
        this.#registry.register(obj, id);

        // holding from GC
        setTimeout(
            (obj) => {
                return obj;
            },
            1000,
            obj
        );

        //
        return id;
    }

    //
    get<R extends dT | string>(key: R): R {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.get(<dT>(<unknown>key)) as any;
        }
        return this.#refMap.get(<string>(<unknown>key))/*?.deref()*/ as any;
    }
}
