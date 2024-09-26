// Will be used when result are predictable in the pools or return results
import UniversalHandler, { redirect, wrapMeta, wrapWeakMap } from "../Handlers/UniversalHandler";
import UUIDMap from "../Utils/UUIDMap";
import TypeDetector from "./TypeDetector.ts";
import {$data} from "../Instruction/InstructionType.ts"
import RemoteReferenceHandler from "../Handlers/RemotePool";

//
const getOrganic = (meta)=>{
    return (meta?.[$data]?.["@uuid"] ?? meta?.["@uuid"]) ? (meta?.[$data] ?? meta) : null;
}

//
export default class PreCoding {
    encoder = new Map<string, any>();
    decoder = new Map<string, any>();
    memoryPool = new UUIDMap();
    handler: UniversalHandler = new UniversalHandler();
    typeDetector = new TypeDetector();

    //
    constructor(memoryPool = new UUIDMap()) {
        this.memoryPool = memoryPool;
        this.encoder = new Map<string, any>([
            ["array", (organic, target, transfer = [])=>{
                if (!organic) {
                    const encoded = Array.from(target).map((e)=>this.encode(e, transfer));
                    return (encoded.some((e)=>(e instanceof Promise || typeof e?.then == "function"))) ? Promise.all(encoded) : encoded;
                }
                return target;
            }],

            //
            ["transfer", (organic, target: any, transfer: any[] = [])=>{
                if (!organic) {
                    if (transfer.indexOf(target) < 0) { transfer.push(target); };
                }
                return target;
            }],

            //
            ["reference", (organic, target, transfer = [])=>{
                const meta   = wrapWeakMap.get(target) ?? getOrganic(target);
                const exists = this?.memoryPool?.get(meta?.["@uuid"])?.deref?.();
                const result = (exists ? {
                    "@type": "reference",
                    "@uuid": this.memoryPool.add(exists)
                } : meta);
                return result;
            }]
        ]);

        //
        this.decoder = new Map<string, any>([
            ["array", (organic, target, transfer = [])=>{
                if (organic) {
                    const isPromised = (target.some((e)=>e instanceof Promise || typeof e?.then == "function"));
                    const encoded = Array.from(target).map((e)=>this.decode(e, transfer));
                    return isPromised ? Promise.all(encoded) : encoded;
                }
                // unusual
                return target;
            }],

            //
            ["reference", (organic, target, transfer = [])=>{
                if (organic) {
                    const exists = this?.memoryPool?.get(target?.["@uuid"] ?? target?.[$data]?.["@uuid"])?.deref?.();
                    if (exists) { return exists; }

                    //
                    const handler = this.handler?.$getHandler?.("remote");
                    if (handler) { return wrapMeta(target, handler); }
                }
                // unusual
                return target;
            }]
        ]);
    }



    //
    $decode(target, transfer: any[] = []) {
        const [o, t] = this.typeDetector.detectType(target, transfer);
        if (this.decoder.has(t)) {
            return this.decoder.get(t)?.(o, target, transfer);
        }
        return target;
    }

    //
    $encode(target, transfer: any[] = []) {
        const [o, t] = this.typeDetector.detectType(target, transfer);
        if (this.encoder.has(t)) {
            return this.encoder.get(t)?.(o, target, transfer);
        }
        return target;
    }



    //
    decode(target, transfer: any[] = []) {
        if (target instanceof Promise || typeof target?.then == "function") {
            return target?.then((e)=>this.$decode(e, transfer));
        }
        return this.$decode(target, transfer);
    }

    //
    encode(target, transfer: any[] = []) {
        if (target instanceof Promise || typeof target?.then == "function") {
            return target?.then((e)=>this.$encode(e, transfer));
        }
        return this.$encode(target, transfer);
    }
}
