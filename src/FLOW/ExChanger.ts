// deno-lint-ignore-file no-explicit-any ban-types
import { UUIDv4 } from './../Utils/UUIDMap.ts';
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import FLOW, { type WorkerContext } from "./FLOW.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool.ts";
import DataHandler from "../Handlers/DataHandler.ts";
import UUIDMap from "../Utils/UUIDMap.ts";
import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve, extract, isPromise } from "../Instruction/Defer.ts";
import { MakeReference} from "../Instruction/InstructionType.ts"
import PromiseHandler from "../Handlers/PromiseHandler.ts";
import ObjectProxy, { IWrap } from "../Instruction/ObjectProxy.ts";
import ORG from "../Instruction/InstructionType.ts";
import { IMeta } from "../Instruction/ObjectProxy.ts";
import { hold } from "../Utils/UUIDMap.ts";

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
    get $imports() { return this.#flow?.$imports || {}; }
    get $sync() { return this.#flow?.sync?.(); }
    async sync() { await this.$sync; return this; }

    //
    $request<T extends unknown>(cmd: string, meta: unknown, args : unknown[]): IWrap<T>|null {
        const transfer: unknown[] = [];
        const encoded = this.#coder?.encode([cmd, meta, ...args], transfer) as any[];
        const result = this.#flow?.callTask?.(encoded, transfer);

        //
        try {
            const coded = doOnlyAfterResolve(result, (res)=>this.#coder?.decode?.(res, transfer));
            if (isPromise(coded)) { return ((new Proxy(MakeReference(coded), new ObjectProxy(this.#handler?.$getHandler?.("promise")))) as IWrap<T>); }
            return coded as IWrap<T>;;
        } catch (e) {
            console.error(e)
        }
        return null;
    }

    //
    //unwrap(obj) { return obj?.[$data] ?? obj; }
    //local(name) { return wrapMeta({ORG.uuid: name, ORG.type: "reference"}, this.#handler); }

    //
    $importToUnit(source: string) { return this.#flow?.importToUnit(source); }
    $importToSelf(module: unknown) { return this.#flow?.importToSelf(module); }

    //
    register<T extends object|Function>(object: T, name = ""): string | null {
        return this.#memoryPool?.add?.(object, name)||"";
    }

    //
    access<T extends unknown>(name = ""): IWrap<T>|null {
        const com = this.$request("access", {
            [ORG.type]: "reference",
            [ORG.uuid]: name
        }, []) as IWrap<T>|null;
        return com;
    }

    // lazy transfer (for passing as arguments)
    transfer<T extends unknown>(node: T | null = null, name: string = "") {
        const meta: IMeta = (extract(node) as IMeta);
        const uuid: string = (name||meta?.[ORG.uuid]||UUIDv4()) as string;
        const real: T = meta?.[ORG.node]??hold(this.#memoryPool?.get?.(uuid))??node;

        //
        if (this.#handler) {
            return new Proxy(MakeReference({
                [ORG.type]: "transfer", 
                [ORG.uuid]: uuid, 
                [ORG.node]: real
            }), new ObjectProxy(this.#handler));
        }

        //
        return null;
    }

    // transfer from remote to host, or transfer actively (default is getter, setter/sender when has node argument)
    doTransfer<T extends unknown>(name: string|IMeta|IWrap<IMeta> = "", node: T | null = null): IWrap<T> {
        let result = null;

        // also you can do it with wrapped already (i.e. getting)
        const meta: IMeta = (extract(node) as IMeta);
        const uuid: string = (name||meta?.[ORG.uuid]||UUIDv4()) as string;
        const real: T = meta?.[ORG.node]??hold(this.#memoryPool?.get?.(uuid))??node;

        // don't needs to transfer from remote
        if (!node && real) { return real as IWrap<T>; };

        //
        if (real != null) {
            // active transfer as argument to remote
            result = this.$request("access", {
                [ORG.type]: "transfer", 
                [ORG.uuid]: uuid, 
                [ORG.node]: real
            }, []);
        } else {
            // access transfer by key from remote
            result = this.$request("transfer", {
                [ORG.type]: "reference",
                [ORG.uuid]: uuid
            }, []);
        }

        //this.#flow?.sync?.();
        return result as IWrap<T>;
    }
}
