import { extract } from "../Handlers/UniversalHandler";

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
            ["arraybuffer", (a:any):boolean=>{
                return (a instanceof ArrayBuffer || a instanceof SharedArrayBuffer);
            }],

            //
            ["typedarray", (a:any):boolean=>{
                return (a?.buffer instanceof ArrayBuffer || a?.buffer instanceof SharedArrayBuffer);
            }],

            //
            ["array", (a:any):boolean=>{
                return Array.isArray(a);
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
                const valid = typeof Symbol.iterator === "symbol";
                if (valid) {
                    console.warn("Potentially invalid type");
                    console.trace(a);
                }
                return valid;
            }],

            // may needs to save into temp object pool for remote access
            ["reference", (a:any):boolean=>{
                return (typeof a == "object" || typeof a == "function");
            }]
        ]);
    }

    // [is organic, defined type]
    detectType(data) {
        // are data meta type, skip definition
        const organic = extract(data) ?? data;
        if (organic?.["@data"] || organic?.["@meta"] || organic?.["@type"]) {
            const meta = organic?.["@data"] || organic?.["@meta"] || organic;
            return [true, meta?.["@type"]];
        }

        // other data are primitives
        for (const [type, def] of this.detection) {
            if (def(data)) return [false, type];
        }

        //
        return [false, "unknown"];
    }
}
