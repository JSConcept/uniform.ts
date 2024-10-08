// deno-lint-ignore-file no-explicit-any
// Will be used when result are predictable in the pools or return results
import { extract, wrapMeta } from "../Instruction/Defer.ts";
import UUIDMap, {hold} from "../Utils/UUIDMap.ts";
import TypeDetector from "./TypeDetector.ts";
import {$data} from "../Instruction/InstructionType.ts"
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import { doOnlyAfterResolve } from "../Instruction/Defer.ts";
 
//
export default class PreCoding {
    $encoder = new Map<string, (organic: boolean, target: unknown, transfer: unknown[])=>boolean>();
    $decoder = new Map<string, (organic: boolean, target: unknown, transfer: unknown[])=>boolean>();
    $memoryPool = new UUIDMap();
    $handler = new UniversalHandler();
    $typeDetector = new TypeDetector();

    //
    constructor(memoryPool = new UUIDMap()) {
        this.$memoryPool = memoryPool;
        this.$encoder = new Map<string, (organic: boolean, target: unknown, transfer: unknown[])=>boolean>([
            ["array", (organic: boolean, target: unknown, transfer: unknown[] = [])=>{
                if (!organic) {
                    const encoded = Array.from((target as []) ||[]).map((e)=>this.encode(e, transfer));
                    return (encoded.some((e)=>(e instanceof Promise || typeof e?.then == "function"))) ? Promise.all(encoded) : encoded;
                }
                return target;
            }],

            //
            ["transfer", (organic: boolean, target: unknown, transfer: unknown[] = [])=>{
                if (!organic) {
                    // non-organic just to transfer
                    if (transfer?.indexOf?.(target) < 0 && target != null) {
                        this.$memoryPool.delete(target);
                        transfer?.push?.(target);
                    };
                } else {
                    // transfers only when is exists
                    const org  = extract(target);
                    const node = org?.["@node"] ?? hold(this?.$memoryPool?.get(org?.["@uuid"]));

                    // if exists
                    if (node != null) {
                        // sometimes, `@uuid` may already known in database
                        const meta = { // request to transfer node
                            "@type": "transfer",
                            "@uuid": org?.["@uuid"]||this?.$memoryPool?.get?.(node)||"",
                            "@node": node
                        }

                        // add to transfer list
                        if (transfer?.indexOf?.(node) < 0) {
                            this.$memoryPool.delete(node);
                            transfer?.push?.(node);
                        }

                        //
                        return meta;
                    }
                    return org;
                }

                // return as regular
                return target;
            }],

            //
            ["reference", (organic: boolean, target: unknown, _transfer: unknown[] = [])=>{
                if (!organic || target?.[$data]) {
                    const meta = {
                        "@type": "reference",
                        "@uuid": this.$memoryPool.add(target as any, extract(target)?.["@uuid"], !organic)
                    };
                    return meta;
                }
                return target;
            }]
        ]);

        //
        this.$decoder = new Map<string, (organic: boolean, target: unknown, transfer: unknown[])=>boolean>([
            ["array", (organic: boolean, target: unknown, transfer: unknown[] = [])=>{
                if (!organic) {
                    const decoded = Array.from(target as []).map((e)=>this.decode(e, transfer));
                    return (decoded.some((e)=>e instanceof Promise || typeof e?.then == "function")) ? Promise.all(decoded) : decoded;
                }
                // unusual
                return target;
            }],

            //
            ["transfer", (organic: boolean, target: unknown, _transfer: unknown[] = [])=>{
                if (organic) {
                    const org  = extract(target);
                    const node = (org?.["@node"]) ?? hold(this?.$memoryPool?.get(org?.["@uuid"]));

                    // unable to override exists
                    if (node != null) {
                        org["@uuid"] = this.$memoryPool.add(node, org?.["@uuid"]||"", organic)
                        return node;
                    };

                    // reformat transfer type, add to registry
                    org["@type"] = "reference";
                    return wrapMeta(org, this.$handler);
                }
                return target;
            }],

            //
            ["reference", (organic: boolean, target: unknown, _transfer: unknown[] = [])=>{
                if (organic) {
                    const org    = extract(target);
                    const exists = hold(this?.$memoryPool?.get(org?.["@uuid"]));
                    if (exists) { return exists; }

                    //
                    return wrapMeta(org, this.$handler);
                }
                // unusual
                return target;
            }]
        ]);
    }



    //
    $decode(target: unknown, transfer: unknown[] = []) {
        const [o, t] = this.$typeDetector.detectType(target, transfer);
        if (this.$decoder.has(t)) {
            return this.$decoder.get(t)?.(o, target, transfer);
        }
        return target;
    }

    //
    $encode(target: unknown, transfer: unknown[] = []) {
        const [o, t] = this.$typeDetector.detectType(target, transfer);
        if (this.$encoder.has(t)) {
            return this.$encoder.get(t)?.(o, target, transfer);
        }
        return target;
    }



    //
    decode(target: unknown|Promise<unknown>, transfer: unknown[] = []) {
        return doOnlyAfterResolve(target, (e)=>this.$decode(e, transfer));
    }

    //
    encode(target: unknown|Promise<unknown>, transfer: unknown[] = []) {
        return doOnlyAfterResolve(target, (e)=>this.$encode(e, transfer));
    }
}
