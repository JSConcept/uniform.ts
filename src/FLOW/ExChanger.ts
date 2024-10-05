import UniversalHandler, { wrapMeta } from "../Handlers/UniversalHandler";
import FLOW, { type WorkerContext } from "./FLOW";
import RemoteReferenceHandler from "../Handlers/RemotePool";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool";
import DataHandler from "../Handlers/DataHandler";
import UUIDMap from "../Utils/UUIDMap";
import PreCoding from "../PreCoding/PreCoding.ts";
import { MakeReference } from "../Instruction/InstructionType";
import ObjectProxy from "../Instruction/ObjectProxy";

//
export const isPromise = (target)=>{
    return target?.then != null && typeof target?.then == "function" || target instanceof Promise;
}

//
export const doOnlyAfterResolve = (meta, cb)=>{
    if (isPromise(meta)) {
        return meta?.then(cb) ?? cb(meta);
    }
    return cb(meta);
}

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
        this.#coder      = this.#flow?.$imports?.$coders;
        this.#handler    = this.#flow?.$imports?.$dataHandler;
        this.#memoryPool = this.#flow?.$imports?.$memoryPool;
        this.#handler?.$addHandler("local", new ObjectPoolMemberHandler(this.#memoryPool));
        this.#handler?.$addHandler("remote", new RemoteReferenceHandler(this));
        this.#handler?.$addHandler("promise", new DataHandler());
    }

    //
    get $imports() {
        return this.#flow?.$imports || {};
    }

    //
    $request(cmd: string, meta: any, ...args : any[]) {
        const encoded = this.#coder?.encode([cmd, meta, ...args]);
        const result = this.#flow?.callTask?.(encoded, []);
        return this.#handler?.$wrapPromise(result);
    }

    //
    $importToUnit(source) { return this.#flow?.importToUnit(source); }
    $importToSelf(module) { return this.#flow?.importToSelf(module); }

    //
    register(object: any, name = "") {
        return this.#memoryPool?.add?.(object, name);
    }

    //
    access(name = "") {
        return this.$request("access", {"@uuid": name, "@type": "reference"}, []);
    }

    //
    transfer(name = "", node = null) {
        if (node != null) {
            return this.$request("access", {"@uuid": name, "@type": "transfer", "@node": node}, []);
        } else {
            return this.$request("transfer", {"@uuid": name, "@type": "reference"}, []);
        }
    }
}
