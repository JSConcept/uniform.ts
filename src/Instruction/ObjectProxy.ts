// deno-lint-ignore-file no-explicit-any ban-types no-explicit-any
import {type $ORG} from "./InstructionType.ts";

//
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

//
export type MPromise<T extends unknown> = Promise<T>|T|null;
export type IWrap<T extends unknown> = {
    [pT in keyof T]: MPromise<pT>|IWrap<pT>;
};

//
export interface IMeta {
    [$ORG.uuid]?: string|null;
    [$ORG.type]?: string|null;
    [$ORG.node]?: unknown|null;
    [$ORG.payload]?: unknown|null;
    [$ORG.index]?: number|null;
};
