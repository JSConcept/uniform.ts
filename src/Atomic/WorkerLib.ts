// deno-lint-ignore-file no-explicit-any
export const loadWorker = (WX: any): Worker|null =>{
    if (WX instanceof Worker) { return WX; } else
    if (typeof WX == "function") { return new WX(); } else 
    if (typeof WX == "string") {
        if (URL.canParse(WX)) { return new Worker(WX, {type: "module"}); };
        return new Worker(URL.createObjectURL(new Blob([WX], {type: "application/javascript"})), {type: "module"});
    } else
    if (WX instanceof Blob || WX instanceof File) {
        return new Worker(URL.createObjectURL(WX), {type: "module"});
    }
    return (typeof self != "undefined" ? self : null) as unknown as Worker;
}

//
export default loadWorker;
