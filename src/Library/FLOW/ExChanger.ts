// deno-lint-ignore-file no-explicit-any ban-types
import ORG, { MakeReference, doOnlyAfterResolve, extract, isPromise, type IWrap, type IMeta, UUIDv4 } from "../Instruction/InstructionType.ts"

//
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool.ts";
import DataHandler from "../Handlers/DataHandler.ts";
import PromiseHandler from "../Handlers/PromiseHandler.ts";
import ObjectProxy from "../Instruction/ObjectProxy.ts";

//
import type UniversalHandler from "../Handlers/UniversalHandler.ts";
import type PreCoding from "../PreCoding/PreCoding.ts";
import type UUIDMap from "../Utils/UUIDMap.ts";

//
import FLOW from "./FLOW.ts";
import { type WorkerContext } from "./WorkerLib.ts";

//
import * as $M from "./MessageChannel.ts";

// should be converted to inline code, and compiled from TS
//const $module$ = new URL("./MessageChannel.ts", import.meta.url).href;

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
        //await this.#flow?.importToUnit($module$);
        await this.sync();
        await this.#flow?.importToSelf($M);
        await this.sync();

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

    //doOnlyAfterResolve
    $makePromise<T extends unknown>(target: T|Promise<T>): IWrap<T>|null {
        //
        try {
            const ext = (target as any)?.[ORG.data] ?? target;
            if (isPromise(target)) { return ((new Proxy(MakeReference(ext), new ObjectProxy(this.#handler?.$getHandler?.("promise")))) as IWrap<T>); }
            return target as IWrap<T>;
        } catch (e) {
            console.error(e);
            return null;
        }
        //return null;
    }

    //
    $act<T extends unknown>(result: T|Promise<T>, cb: (result: T) => void): IWrap<T>|null {
        try {
            return this.$makePromise(doOnlyAfterResolve(result, cb));
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    //
    $request<T extends unknown>(cmd: string, meta: unknown, args : unknown[]): IWrap<T>|null {
        const transfer: unknown[] = [];
        const encoded = this.#coder?.encode([cmd, meta, ...args], transfer) as any[];
        const result = this.#flow?.callTask?.(encoded, transfer);

        //
        try {
            return this.$act(result, (res)=>this.#coder?.decode?.(res, transfer)) as IWrap<T>|null;
        } catch (e) {
            console.error(e)
            return null;
        }
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
    transfer<T extends unknown>($node: T | null = null, name: string = "") {
        return this.$act($node, (node)=>{
            const meta: IMeta = (extract(node) as IMeta);
            const uuid: string = (name || (meta as any)?.[ORG.uuid] || UUIDv4()) as string;
            const real: T = (meta as any)?.[ORG.node] ?? this.#memoryPool?.get?.(uuid) ?? node;

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
        });
        
    }

    // transfer from remote to host, or transfer actively (default is getter, setter/sender when has node argument)
    doTransfer<T extends unknown>($name: string|IMeta|IWrap<IMeta> = "", node: T | null = null): IWrap<T>|null {
        return this.$act<any>($name, (name: any): IWrap<T>|null => {
            return this.$act(node, (result: any): IWrap<T>|null =>{

                // @ts-ignore "sometimes, may got new UUID, or exists"
                const esm: IMeta = (extract(name) as IMeta);

                // also you can do it with wrapped already (i.e. getting)
                const meta: IMeta = (extract(result) as IMeta);
                const uuid: string = ((esm as any)?.[ORG.uuid]||name||(meta as any)?.[ORG.uuid]||UUIDv4()||"") as string;
                const real: T = (meta as any)?.[ORG.node] ?? this.#memoryPool?.get?.(uuid) ?? result??(esm as any)?.[ORG.node];

                // @ts-ignore "make meta uuid equal"
                if (esm  != null) {  esm[ORG.uuid] = (uuid||"") as string; }; // assign uuid to meta

                // @ts-ignore "make meta uuid equal"
                if (meta != null) { meta[ORG.uuid] = (uuid||"") as string; }; // assign uuid to meta

                // don't needs to transfer from remote
                if (!result && real) { return real as IWrap<T>; };

                // active transfer as argument to remote
                result = (real != null ? this.$request("access", {
                    [ORG.type]: "transfer", 
                    [ORG.uuid]: uuid, 
                    [ORG.node]: real
                }, []) : this.$request("transfer", (esm ?? {
                    [ORG.type]: "reference",
                    [ORG.uuid]: uuid
                }), []));

                //this.#flow?.sync?.();
                return result as IWrap<T>;
            });
        });
    }
}
