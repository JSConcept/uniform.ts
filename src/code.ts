/*@__PURE__*/ 
import $raw$ from "./worker.ts?worker&compress.ts"; const IW = $raw$;

/*@__PURE__*/ 
const loadCompressed = async (b64c: string): Promise<string|null> => {
    const blob = new Blob([Uint8Array.from(atob(b64c), c => c.charCodeAt(0))], {type: "application/gzip"});
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    const response = await (new Response(decompressedStream, {headers: new Headers({"Content-Type": "application/javascript" })})).blob();
    return URL.createObjectURL(response);
}

/*@__PURE__*/ export const PRELOAD = /*@__PURE__*/ !URL.canParse(IW) ? /*@__PURE__*/ loadCompressed(IW as unknown as string) : IW;
/*@__PURE__*/ export default PRELOAD;
