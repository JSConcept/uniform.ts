import PromiseStack from '../Utils/PromiseStack.ts';

// @ts-ignore
type WorkerContext = Worker | WorkerGlobalScope;

// FLOW - is web worker library core (low-level)...
export default class FLOW {
    #worker: WorkerContext | null = null;//new Worker("./FLOW-Unit.ts");
    #promiseStack: PromiseStack = new PromiseStack();
    #imports = {};

    //
    constructor(
        worker: WorkerContext | null = null,
        promiseStack: PromiseStack = new PromiseStack()
    ) {
        this.#worker = worker || new Worker(new URL("./FLOW-Unit.ts", import.meta.url).href);
        this.#promiseStack = promiseStack ?? new PromiseStack();
        this.#imports = {};

        //
        const self: WorkerContext | null = this.#worker;
        self?.addEventListener("message", (ev)=>{
            const {cmd, uuid, dir} = ev.data;
            if (dir == "req") {
                if (cmd == "import") {
                    import(ev.data.source).then((m)=>{
                        Object.assign(this.#imports, m);
                        // @ts-ignore
                        self?.postMessage({ cmd, uuid, dir: "res", result: "ok" });
                    });
                } else
                if (cmd == "call") {
                    // call with FLOW "this" context
                    const syncOrAsync = this.#imports[ev.data.handler]?.apply?.(self, ev.data) ?? ev.data.args;
                    const resolveWith = (pass)=>{
                        const [result, transfer] = pass;
                        // @ts-ignore
                        self?.postMessage({
                            resolver: "$resolver",
                            cmd,
                            uuid,
                            dir: "res",
                            result
                        }, [...new Set(transfer||[])] as StructuredSerializeOptions);
                    }

                    //
                    if (syncOrAsync instanceof Promise || typeof syncOrAsync?.then == "function") {
                        syncOrAsync.then(resolveWith);
                    } else {
                        resolveWith(syncOrAsync);
                    }
                }
            } else
            if (dir == "res") {
                const resolved = this.#imports[ev.data.resolver]?.apply(self, ev.data) ?? (ev.data.result);
                this.#promiseStack?.resolveBy?.(uuid, resolved);
            }
        });
    }

    //
    importToSelf(module) {
        Object.assign(this.#imports, module);
        return this;
    }

    //
    importToUnit(source) {
        const pair = this.#promiseStack?.create();
        // @ts-ignore
        this.#worker?.postMessage?.({
            handler: "$import",
            cmd: "import",
            dir: "req",
            uuid: pair?.[0] || "",
            source
        });
        return pair?.[1];
    }

    //
    callTask(args = [], transfer = []) {
        const pair = this.#promiseStack?.create();
        // @ts-ignore
        this.#worker?.postMessage?.({
            handler: "$handler",
            cmd: "call",
            dir: "req",
            uuid: pair?.[0] || "",
            args
        }, [...new Set(transfer||[])] as StructuredSerializeOptions);
        return pair?.[1];
    }
}
