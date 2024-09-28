// Will be used when result are predictable in the pools or return results
import UniversalHandler, { extract, redirect, wrapMeta, wrapWeakMap } from "../Handlers/UniversalHandler";
import UUIDMap from "../Utils/UUIDMap";
import TypeDetector from "./TypeDetector.ts";
//import {$data} from "../Instruction/InstructionType.ts"
//import RemoteReferenceHandler from "../Handlers/RemotePool";

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
                if (!organic) { if (transfer.indexOf(target) < 0) { transfer.push(target); }; }
                return target;
            }],

            //
            ["reference", (organic, target, transfer = [])=>{
                return {
                    "@type": "reference",
                    "@uuid": this.memoryPool.add(target, extract(target)?.["@uuid"])
                }
            }]
        ]);

        //
        this.decoder = new Map<string, any>([
            ["array", (organic, target, transfer = [])=>{
                if (!organic) {
                    const decoded = Array.from(target).map((e)=>this.decode(e, transfer));
                    return (decoded.some((e)=>e instanceof Promise || typeof e?.then == "function")) ? Promise.all(decoded) : decoded;
                }
                // unusual
                return target;
            }],

            //
            ["reference", (organic, target, transfer = [])=>{
                if (organic) {
                    const org    = extract(target);
                    const exists = this?.memoryPool?.get(org?.["@uuid"])?.deref?.();
                    if (exists) { return exists; }

                    //
                    const handler = this.handler?.$getHandler?.("remote");
                    if (handler) { return wrapMeta(org, handler); }
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
