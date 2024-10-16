
//! loads worker, used by host code!
/*@__MANGLE_PROP__*/ import $raw$ from "./index.ts?worker&compress"; /*@__MANGLE_PROP__*/ const IW = $raw$;
/*@__PURE__*/ /*@__MANGLE_PROP__*/ 
const loadCompressed = async (b64c: string): Promise<string|null> => {
    const blob = new Blob([Uint8Array.from(atob(b64c), c => c.charCodeAt(0))], {type: "application/gzip"});
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    const response = await (new Response(decompressedStream, {headers: new Headers({"Content-Type": "application/javascript" })})).blob();
    return URL.createObjectURL(response);
}
/*@__MANGLE_PROP__*/ export const PRELOAD = !URL.canParse(IW) ? /*@__PURE__*/ /*@__MANGLE_PROP__*/ loadCompressed(IW as unknown as string) : IW;
/*@__MANGLE_PROP__*/ export default PRELOAD;
