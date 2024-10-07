// deno-lint-ignore-file no-explicit-any
export default class ObjectProxy {
    #handlerUtils: any = {};

    //
    constructor(handlerUtils = {}) {
        this.#handlerUtils = handlerUtils;
    }

    //
    access(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("access", target, ...args);
    }

    //
    get(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("get", target, ...args);
    }

    //
    set(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("set", target, ...args);
    }

    //
    has(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("has", target, ...args);
    }

    //
    call(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("call", target, ...args);
    }

    //
    apply(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("apply", target, ...args);
    }

    //
    construct(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("construct", target, ...args);
    }

    //
    deleteProperty(target: unknown, ...args: unknown[]) {
        return this.#handlerUtils.$handle("deleteProperty", target, ...args);
    }
}
