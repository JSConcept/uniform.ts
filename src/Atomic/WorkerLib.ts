// deno-lint-ignore-file no-explicit-any
export const loadWorker = (WX: any): Worker|null =>{
    if (WX instanceof Worker) { return WX; } else
    if (typeof WX == "function") { return new WX(); } else 
    if (typeof WX == "string") { return new Worker(WX, {type: "module"}); }
    return null;
}

//
export default loadWorker;
