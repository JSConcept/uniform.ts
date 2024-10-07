// deno-lint-ignore-file ban-types
export const $data = Symbol("@data");
export const MakeReference = (data: any = null): Function => {
    // not ordinal not acceptable
    if (data == null || (typeof data != "function" && typeof data != "object")) {
        return data;
    }

    // already is functional, skip it
    if (typeof data == "function" && data?.[$data]) { return data; }

    // make function or class compatible for proxy
    const fx = function(this: any) { if (this != null) { this[$data] = data; }; }
    if (fx != null) {
        fx.prototype.stringify = function (){ return JSON.stringify(this[$data] || "{}"); }
        fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }
        fx[$data] = data;
    }

    //
    return fx;
}

// any meta contains, and can't to be primitive or array directly
// only constructor, function, or object

/*
 * Internal types of meta
 * ["@meta"|"@data"]: {
 *   "@type": string, // interpretation type (how will resolved)
 *   "@uuid": string, // located in remote storage pool
 *   "@payload": any, // additional descriptions
 *   "@index": number // located in transferable list
 * }
 */
