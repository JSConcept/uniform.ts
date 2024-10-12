// deno-lint-ignore-file no-explicit-any ban-types no-explicit-any
export default class ObjectProxy<T extends object|Function> implements ProxyHandler<T> {
    #handlerUtils: any = {};

    //
    constructor(handlerUtils = {}) {
        this.#handlerUtils = handlerUtils;
    }

    //
    access(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("access", target, ...args);
    }

    //
    get(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("get", target, ...args);
    }

    //
    set(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("set", target, ...args);
    }

    //
    has(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("has", target, ...args);
    }

    //
    call(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("call", target, ...args);
    }

    //
    apply(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("apply", target, ...args);
    }

    //
    construct(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("construct", target, ...args);
    }

    //
    deleteProperty(target: T, ...args: unknown[]) {
        return this.#handlerUtils.$handle("deleteProperty", target, ...args);
    }
}

