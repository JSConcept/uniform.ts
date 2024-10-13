// deno-lint-ignore-file no-explicit-any
import { Transferable, doOnlyAfterResolve } from "../Utils/Useful.ts";
import PromiseStack from '../Utils/PromiseStack.ts';

// FLOW - is web worker library core (low-level)...
export default class FLOW {
    #worker: any | null = null;
    #promiseStack: PromiseStack<unknown> = new PromiseStack<unknown>();
    #imports: any = {};

    //
    constructor(worker: any | null = null) {
        this.#worker = worker;// || defaultWorker;
        this.#imports = {};

        //
        (worker ??= this.#worker)?.addEventListener("message", (ev: any)=>{
            if (!ev?.data) { console.log(ev); return; }
            const {cmd, uuid, dir, status, shared} = ev.data;
            if (dir == "req") {
                if (cmd == "ping") {
                    worker?.postMessage({ cmd, uuid, dir: "res", status: "ok", result: "ok", shared: null });
                } else
                if (cmd == "import") {
                    /*@__PURE__*/ import(/* @vite-ignore */ /*@__PURE__*/ ("" + ev.data.source))?.then?.((m)=>{
                        /*@__PURE__*/ Object.assign(this.#imports, (m.default ?? m));
                        worker?.postMessage({ cmd, uuid, dir: "res", status: "ok", result: "ok", shared: null });
                    })?.catch?.((e)=>{
                        /*@__PURE__*/ console.error(e);
                        /*@__PURE__*/ console.trace(e);
                        worker?.postMessage({ cmd, uuid, dir: "res", status: "error", result: "unsupported", shared: null });
                    });
                } else
                if (cmd == "call") {
                    // hoot shared channels for direct answer
                    /*@__PURE__*/ (shared ? this.#promiseStack?.hook?.(uuid, shared) : null);

                    // call with FLOW "this" context
                    try {
                        doOnlyAfterResolve(this.#imports[ev.data.handler]?.apply?.(self, [ev.data]) ?? ev.data.args, (syncOrAsync)=>{
                            doOnlyAfterResolve(syncOrAsync, (pass)=>{
                                const [$r, transfer] = pass;
                                doOnlyAfterResolve($r, (result)=>{
                                    worker?.postMessage({
                                        handler: "$resolver",
                                        status: "ok",
                                        cmd,
                                        uuid,
                                        dir: "res",
                                        result,
                                        shared
                                    }, [...new Set(Array.from(transfer||[]))].filter((e)=>Transferable.some((I)=>e instanceof I)) as StructuredSerializeOptions);

                                    // resolve when sync supported
                                    /*@__PURE__*/ this.#promiseStack?.resolveBy?.(uuid, result);
                                });
                            });
                        });
                    } catch(e: any) {
                        /*@__PURE__*/ console.error(e);
                        /*@__PURE__*/ console.trace(e);

                        //
                        const reason = e.message;
                        worker?.postMessage({
                            handler: "$resolver",
                            status: "error",
                            cmd,
                            uuid,
                            dir: "res",
                            result: reason,
                            shared: null
                        }, []);

                        // resolve when sync supported
                        /*@__PURE__*/ this.#promiseStack?.rejectBy?.(uuid, reason);
                    }
                } else {
                    /*@__PURE__*/ console.error("Internal command: " + cmd + " not supported.");
                    worker?.postMessage({ cmd, uuid, dir: "res", status: "error", result: "unknown" });
                }
            } else
            if (dir == "res") {
                try {
                    const resolved = this.#imports?.[ev.data.handler]?.apply?.(self, [ev.data]) ?? (ev.data.result) ?? null;
                    this.#promiseStack?.[status != "error" ? "resolveBy" : "rejectBy"]?.(uuid, resolved ?? null);
                } catch(e: any) {
                    /*@__PURE__*/ console.error(e);
                    /*@__PURE__*/ console.trace(e);
                    this.#promiseStack?.rejectBy?.(uuid, e?.message);
                }
            }
        });
    }

    //
    get $imports() {
        return this.#imports;
    }

    //
    importToSelf(module: any) {
        Object.assign(this.#imports, (module)?.default ?? module);
        return this;
    }

    /*@__PURE__*/
    importToUnit(source: string, /*@__PURE__*/ sync = false) {
        /*@__PURE__*/ 
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        this.#worker?.postMessage?.({
            status: "pending",
            handler: "$import",
            cmd: "import",
            dir: "req",
            shared: pair?.[2],
            uuid: pair?.[0] || "",
            source
        });
        return pair?.[1];
    }

    /*@__PURE__*/
    sync(/*@__PURE__*/ sync = false) {
        /*@__PURE__*/ 
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        this.#worker?.postMessage?.({
            status: "pending",
            shared: pair?.[2],
            handler: null,
            cmd: "ping",
            dir: "req",
            uuid: pair?.[0] || ""
        });
        return pair?.[1];
    }

    callTask($args: any[] = [], transfer: unknown[] = [], /*@__PURE__*/ sync = false) {
        /*@__PURE__*/ 
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        doOnlyAfterResolve($args, (args)=>{
            this.#worker?.postMessage?.({
                status: "pending",
                handler: "$handler",
                cmd: "call",
                dir: "req",
                uuid: pair?.[0] || "",
                shared: pair?.[2],
                args
            }, [...new Set(transfer||[])] as StructuredSerializeOptions);
        });
        return pair?.[1];
    }
}
