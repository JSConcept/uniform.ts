// deno-lint-ignore-file no-explicit-any

/*
//@ts-ignore "mixed context"
export type WorkerContext = Worker | WorkerGlobalScope;

//@ts-ignore "mixed context"
const isWorker = typeof Worker == "undefined" || typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope;

//
export const loadWorker = (WX: any): WorkerContext =>{
    if (!isWorker) {
        if (WX instanceof Worker) { return WX; } else
        if (typeof WX == "function") { return new WX(); } else 
        if (typeof WX == "string") { return new Worker(WX, {type: "module"}); }
    }
    return self;
}

//
export default loadWorker;
*/

//
export const loadWorker = (WX: any): Worker|null =>{
    if (WX instanceof Worker) { return WX; } else
    if (typeof WX == "function") { return new WX(); } else 
    if (typeof WX == "string") { return new Worker(WX, {type: "module"}); }
    return null;
}

//
export default loadWorker;
