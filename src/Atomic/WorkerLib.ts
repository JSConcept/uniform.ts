// deno-lint-ignore-file no-explicit-any
export const loadWorker = (WX: any): Worker|null =>{
    if (WX instanceof Worker) { return WX; } else
    if (typeof WX == "function") { return new WX(); } else 
    if (typeof WX == "string") { return new Worker(WX, {type: "module"}); }
    return null;
}

//
export const loadCompressed = async (b64c: string): Promise<string|null> => {
    const blob = new Blob([Uint8Array.from(atob(b64c), c => c.charCodeAt(0))], {type: "application/gzip"});
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    const response = await (new Response(decompressedStream, {headers: new Headers({"Content-Type": "application/javascript" })})).blob();
    return URL.createObjectURL(response);
}

//
export default loadWorker;
