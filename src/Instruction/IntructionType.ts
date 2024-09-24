export const MakeReference = (data = {}): Function => {
    const fx = function() { this["@data"] = data; }
    fx.prototype.stringify = function (){ return JSON.stringify(this["@data"] || "{}"); }
    fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }
    return fx;
}
