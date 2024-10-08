// deno-lint-ignore-file no-explicit-any
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import FLOW, { type WorkerContext } from "./FLOW.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool.ts";
import DataHandler from "../Handlers/DataHandler.ts";
import UUIDMap from "../Utils/UUIDMap.ts";
import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve, isPromise } from "../Instruction/Defer.ts";
import { MakeReference} from "../Instruction/InstructionType.ts"
import PromiseHandler from "../Handlers/PromiseHandler.ts";
import ObjectProxy from "../Instruction/ObjectProxy.ts";

//
export default class ExChanger {
    #flow: FLOW | null = null;
    #handler: UniversalHandler | null = null;
    #memoryPool: UUIDMap | null = null;
    #coder: PreCoding | null = null;

    //
    constructor(context: WorkerContext) {
        this.#flow = new FLOW(context);
    }

    //
    async initialize() {
        await this.#flow?.importToUnit("./MessageChannel.ts");
        await this.#flow?.importToSelf(import("./MessageChannel.ts"));

        //
        this.#coder      = this.#flow?.$imports?.$coders      ?? this.#coder;
        this.#memoryPool = this.#flow?.$imports?.$memoryPool  ?? this.#memoryPool;
        this.#handler    = this.#flow?.$imports?.$dataHandler ?? this.#handler;

        //
        if (this.#handler) {
            this.#handler?.$addHandler("local", new ObjectPoolMemberHandler(this.#memoryPool));
            this.#handler?.$addHandler("remote", new RemoteReferenceHandler(this));
            this.#handler?.$addHandler("promise", new PromiseHandler());
            this.#handler?.$addHandler("direct", new DataHandler());
        } else {
            throw Error("Invalid Native Module!");
        }

        //
        return this.sync();
    }

    //
    get $imports() {
        return this.#flow?.$imports || {};
    }

    //
    $sync() { return this.#flow?.sync?.(); }
    $request(cmd: string, meta: unknown, args : unknown[]) {
        const transfer: unknown[] = [];
        const encoded = this.#coder?.encode([cmd, meta, ...args], transfer) as any[];
        const result = this.#flow?.callTask?.(encoded, transfer);
        const coded = doOnlyAfterResolve(result, (res)=>this.#coder?.decode?.(res, transfer));

        //
        if (isPromise(coded)) { return new Proxy(MakeReference(coded), new ObjectProxy(this.#handler?.$getHandler?.("promise"))); }
        return coded;
    }

    //
    //unwrap(obj) { return obj?.[$data] ?? obj; }
    //local(name) { return wrapMeta({"@uuid": name, "@type": "reference"}, this.#handler); }

    //
    $importToUnit(source: string) { return this.#flow?.importToUnit(source); }
    $importToSelf(module: unknown) { return this.#flow?.importToSelf(module); }

    //
    async sync() { await this.$sync(); return this; }

    //
    register(object: any, name = "") {
        const uuid = this.#memoryPool?.add?.(object, name);
        //this.#flow?.sync?.();
        return uuid;
    }

    //
    access(name = "") {
        const com = this.$request("access", {"@uuid": name, "@type": "reference"}, []);
        //this.#flow?.sync?.();
        return com;
    }

    //
    transfer<T extends unknown>(name = "", node: T | null = null): T {
        let result = null;
        if (node != null) {
            result = this.$request("access", {"@uuid": name, "@type": "transfer", "@node": node}, []);
        } else {
            result = this.$request("transfer", {"@uuid": name, "@type": "reference"}, []);
        }
        //this.#flow?.sync?.();
        return result as T;
    }
}
