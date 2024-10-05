import { extract } from "../Handlers/UniversalHandler";
import { $data } from "../Instruction/InstructionType"

//
export default class TypeDetector {
    detection: Map<string, (d:any)=>boolean> = new Map<string, (d:any)=>boolean>();

    // we working only with unwrapped data, we doesn't accept any promise directly
    constructor() {
        //
        this.detection = new Map<string, (d:any)=>boolean>([
            ["primitive", (a:any):boolean=>{
                return (typeof a != "object" && typeof a != "function" || typeof a == "undefined" || a == null);
            }],

            //
            //["transfer", (a:any):boolean=>{
                //return (a instanceof ArrayBuffer || a instanceof MessagePort || a instanceof ImageBitmap || a instanceof OffscreenCanvas || a instanceof ReadableStream || a instanceof WritableStream);
            //}],

            //
            ["array", (a:any):boolean=>{
                return Array.isArray(a);
            }],

            //
            ["arraybuffer", (a:any):boolean=>{
                return (a instanceof ArrayBuffer /*|| a instanceof SharedArrayBuffer*/);
            }],

            //
            ["typedarray", (a:any):boolean=>{
                return (a?.buffer instanceof ArrayBuffer /*|| a?.buffer instanceof SharedArrayBuffer*/);
            }],

            //
            ["promise", (a:any):boolean=>{
                const valid = typeof a?.then == "function" || a instanceof Promise;
                if (valid) {
                    console.warn("Potentially invalid type");
                    console.trace(a);
                }
                return valid;
            }],

            //
            ["symbol", (a:any):boolean=>{
                return typeof a === 'symbol' || typeof a === 'object' && Object.prototype.toString.call (a) === '[object Symbol]';
            }],

            // may needs to save into temp object pool for remote access
            ["reference", (a:any):boolean=>{
                const fx = (typeof a == "object" || typeof a == "function");
                return fx;
            }]
        ]);
    }

    // [is organic, defined type]
    detectType(data, transfer: any[] = []) {
        // are data meta type, skip definition
        const organic = extract(data);
        if (organic?.["@type"]) {
            return [true, organic?.["@type"]];
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
