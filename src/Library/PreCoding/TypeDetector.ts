// deno-lint-ignore-file no-explicit-any
import { extract } from "../Utils/InstructionType.ts";
import { ORG, isPromise } from "../Utils/Useful.ts";

//
export default class TypeDetector {
    detection: Map<string, (d: unknown)=>boolean> = new Map<string, (d: unknown)=>boolean>();

    // we working only with unwrapped data, we doesn't accept any promise directly
    constructor() {
        //
        this.detection = new Map<string, (d: unknown)=>boolean>([
            ["primitive", (a: unknown): boolean=>{
                return (typeof a != "object" && typeof a != "function" || typeof a == "undefined" || a == null);
            }],

            //
            //["transfer", (a:any):boolean=>{
                //return (a instanceof ArrayBuffer || a instanceof MessagePort || a instanceof ImageBitmap || a instanceof OffscreenCanvas || a instanceof ReadableStream || a instanceof WritableStream);
            //}],

            //
            ["array", (a: unknown): boolean=>{
                return Array.isArray(a);
            }],

            //
            ["arraybuffer", (a: unknown): boolean=>{
                return (a instanceof ArrayBuffer || (typeof SharedArrayBuffer != "undefined" && a instanceof SharedArrayBuffer));
            }],

            //
            ["typedarray", (a: unknown): boolean=>{
                const $buffer: unknown = (a as any)?.buffer;
                return ($buffer instanceof ArrayBuffer || (typeof SharedArrayBuffer != "undefined" && $buffer instanceof SharedArrayBuffer));
            }],

            //
            ["promise", (a: unknown|Promise<unknown>): boolean=>{
                const valid = isPromise(a);
                if (valid) {
                    console.warn("Potentially invalid type");
                    console.trace(a);
                }
                return valid;
            }],

            //
            ["symbol", (a: unknown): boolean=>{
                return typeof a === 'symbol' || typeof a === 'object' && Object.prototype.toString.call (a) === '[object Symbol]';
            }],

            // may needs to save into temp object pool for remote access
            ["reference", (a: unknown): boolean=>{
                const fx = (typeof a == "object" || typeof a == "function");
                return fx;
            }]
        ]);
    }

    // [is organic, defined type]
    detectType(data: unknown, transfer: unknown[] = []): [boolean, string] {
        // are data meta type, skip definition
        const organic = extract(data) as any;
        if ((organic as any)?.[ORG.type]) {
            return [true, (organic as any)?.[ORG.type] as string];
        } else

        //
        if (transfer.indexOf(data) >= 0) {
            return [false, "transfer"];
        }

        // other data are primitives
        for (const [type, def] of this.detection) {
            if (def(data)) {
                return [false, type];
            }
        }

        //
        return [false, "unknown"];
    }
}
