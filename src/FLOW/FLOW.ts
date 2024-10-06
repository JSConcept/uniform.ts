import { doOnlyAfterResolve } from "../Instruction/Defer.ts";
import PromiseStack from '../Utils/PromiseStack.ts';

// @ts-ignore
export type WorkerContext = Worker | WorkerGlobalScope;
// FLOW - is web worker library core (low-level)...
export default class FLOW {
    #worker: WorkerContext | null = null;//new Worker("./FLOW-Unit.ts");
    #promiseStack: PromiseStack = new PromiseStack();
    #imports: any = {};

    //
    constructor(
        worker: WorkerContext | null = null,
        promiseStack: PromiseStack = new PromiseStack()
    ) {
        this.#worker = worker || new Worker(new URL("./ExChangerUnit.ts", import.meta.url).href, {type: "module"});
        this.#promiseStack = promiseStack ?? new PromiseStack();
        this.#imports = {};

        //
        const self: WorkerContext | null = this.#worker;
        self?.addEventListener("message", (ev)=>{
            if (!ev?.data) { console.log(ev); return; }
            const {cmd, uuid, dir, shared} = ev.data;
            if (dir == "req") {
                if (cmd == "ping") {
                    self?.postMessage({ cmd, uuid, dir: "res", result: "ok" });
                } else
                if (cmd == "import") {
                    import(ev.data.source).then((m)=>{
                        Object.assign(this.#imports, (m.default ?? m));
                        // @ts-ignore
                        self?.postMessage({ cmd, uuid, dir: "res", result: "ok" });
                    });
                } else
                if (cmd == "call") {
                    // call with FLOW "this" context
                    doOnlyAfterResolve(this.#imports[ev.data.handler]?.apply?.(self, [ev.data]) ?? ev.data.args, (syncOrAsync)=>{
                        doOnlyAfterResolve(syncOrAsync, (pass)=>{
                            const [$r, transfer] = pass;
                            doOnlyAfterResolve($r, (result)=>{
                                // @ts-ignore
                                self?.postMessage({
                                    handler: "$resolver",
                                    cmd,
                                    uuid,
                                    dir: "res",
                                    result
                                }, [...new Set(Array.from(transfer||[]))] as StructuredSerializeOptions);

                                // resolve when sync supported
                                (shared ? this.#promiseStack?.hook?.(uuid, shared) : null);
                                this.#promiseStack?.resolveBy?.(uuid, result);
                            });
                        });
                    });
                }
            } else
            if (dir == "res") {
                const resolved = this.#imports[ev.data.handler]?.apply(self, [ev.data]) ?? (ev.data.result);
                this.#promiseStack?.resolveBy?.(uuid, resolved);
            }
        });
    }

    //
    get $imports() {
        return this.#imports;
    }

    //
    async importToSelf(module) {
        Object.assign(this.#imports, ((await module)?.default ?? (await module)));
        return this;
    }

    //
    importToUnit(source, sync = false) {
        const remain = this.#promiseStack?.sync;
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        doOnlyAfterResolve(remain, ()=>{
            this.#worker?.postMessage?.({
                handler: "$import",
                cmd: "import",
                dir: "req",
                shared: pair?.[2],
                uuid: pair?.[0] || "",
                source
            });
        });
        return pair?.[1];
    }

    //
    sync(sync = false) {
        const remain = this.#promiseStack?.sync;
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        doOnlyAfterResolve(remain, ()=>{
            this.#worker?.postMessage?.({
                shared: pair?.[2],
                cmd: "ping",
                dir: "req",
                uuid: pair?.[0] || ""
            });
        });
        return Promise.all([pair?.[1], remain]);
    }

    //
    callTask($args: any[] = [], transfer = [], sync = false) {
        const remain = this.#promiseStack?.sync;
        const pair = this.#promiseStack?.[sync ? "createSync" : "create"]?.();
        doOnlyAfterResolve(remain, ()=>{
            doOnlyAfterResolve($args, (args)=>{
                this.#worker?.postMessage?.({
                    handler: "$handler",
                    cmd: "call",
                    dir: "req",
                    uuid: pair?.[0] || "",
                    shared: pair?.[2],
                    args
                }, [...new Set(transfer||[])] as StructuredSerializeOptions);
            });
        });
        return pair?.[1];
    }
}
