export const $data = Symbol("@data");
export const MakeReference = (data = {}): Function => {
    const fx = function() { this[$data] = data; }
    fx.prototype.stringify = function (){ return JSON.stringify(this[$data] || "{}"); }
    fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }
    fx[$data] = data;
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
