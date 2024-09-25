export default class ObjectProxy {
    #handlerUtils: any = {};

    //
    constructor(handlerUtils = {}) {
        this.#handlerUtils = handlerUtils;
    }

    //
    access(target, ...args) {
        return this.#handlerUtils.$handle("access", target, ...args);
    }

    //
    get(target, ...args) {
        return this.#handlerUtils.$handle("get", target, ...args);
    }

    //
    set(target, ...args) {
        return this.#handlerUtils.$handle("set", target, ...args);
    }

    //
    has(target, ...args) {
        return this.#handlerUtils.$handle("has", target, ...args);
    }

    //
    call(target, ...args) {
        return this.#handlerUtils.$handle("call", target, ...args);
    }

    //
    apply(target, ...args) {
        return this.#handlerUtils.$handle("apply", target, ...args);
    }

    //
    construct(target, ...args) {
        return this.#handlerUtils.$handle("construct", target, ...args);
    }

    //
    deleteProperty(target, ...args) {
        return this.#handlerUtils.$handle("deleteProperty", target, ...args);
    }
}
