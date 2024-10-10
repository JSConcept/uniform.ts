// deno-lint-ignore-file ban-types no-explicit-any no-explicit-any ban-types no-explicit-any no-explicit-any
export const UUIDv4 = () => {
    return (crypto?.randomUUID ? crypto?.randomUUID() : ("10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))));
};

//
export enum $ORG {
    type = "!#type#!",
    uuid = "!#uuid#!",
    node = "!#node#!",
    payload = "!#payload#!",
    index = "!#index#!",
    exchanger = "!#exchanger#!"
}

// 
export const ORG = {
    sync: Symbol("@sync"),
    data: Symbol("@data"),
    exchanger: $ORG.exchanger,//Symbol("@exchanger"),
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}

//
export const MakeReference = (data: any = null): Function|object => {
    // not ordinal not acceptable
    if (data == null || (typeof data != "function" && typeof data != "object")) {
        return data;
    }

    // already is functional, skip it
    if (typeof data == "function" && data?.[ORG.data]) { return data; }

    // make function or class compatible for proxy
    const fx = function(this: any) { if (this != null) { this[ORG.data] = data; }; }
    if (fx != null) {
        fx.prototype.stringify = function (){ return JSON.stringify(this[ORG.data] || "{}"); }
        fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }

        // @ts-ignore "typescript not supports Symbol"
        fx[ORG.data] = data;
    }

    //
    return fx;
}

// any meta contains, and can't to be primitive or array directly
// only constructor, function, or object

/*
 * Internal types of meta
 * ["@meta"|"@data"]: {
 *   !type: string, // interpretation type (how will resolved)
 *   !uuid: string, // located in remote storage pool
 *   !payload: any, // additional descriptions
 *   !index: number // located in transferable list
 * }
 */

//
export default ORG;

// If someone not in list, will just copy or sharing
// @ts-ignore "Transferable list for web workers (automatic)"
export const Transferable = [
    /* @ts-ignore "" */ typeof ArrayBuffer               != "undefined" ? ArrayBuffer               : null,
    /* @ts-ignore "" */ typeof MessagePort               != "undefined" ? MessagePort               : null,
    /* @ts-ignore "" */ typeof ReadableStream            != "undefined" ? ReadableStream            : null,
    /* @ts-ignore "" */ typeof WritableStream            != "undefined" ? WritableStream            : null,
    /* @ts-ignore "" */ typeof TransformStream           != "undefined" ? TransformStream           : null,
    /* @ts-ignore "" */ typeof WebTransportReceiveStream != "undefined" ? WebTransportReceiveStream : null,
    /* @ts-ignore "" */ typeof WebTransportSendStream    != "undefined" ? WebTransportSendStream    : null,
    /* @ts-ignore "" */ typeof AudioData                 != "undefined" ? AudioData                 : null,
    /* @ts-ignore "" */ typeof ImageBitmap               != "undefined" ? ImageBitmap               : null,
    /* @ts-ignore "" */ typeof VideoFrame                != "undefined" ? VideoFrame                : null,
    /* @ts-ignore "" */ typeof OffscreenCanvas           != "undefined" ? OffscreenCanvas           : null,
    /* @ts-ignore "" */ typeof RTCDataChannel            != "undefined" ? RTCDataChannel            : null
].filter((E)=>(E!=null));
