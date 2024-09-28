//
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};

//
export type dT = object | Function;
export type rT = WeakRef<dT>;

//
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

    //
    add(obj: dT, id: string = "") {
        if (!(typeof obj == "object" || typeof obj == "function")) return obj;

        // never override already added
        if (id && this.#refMap.has(id)) {return id; id = UUIDv4();}

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
        return this.#refMap.get(<string>(<unknown>key)) as any;
    }
}
