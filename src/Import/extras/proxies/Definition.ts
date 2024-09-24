const Descriptions = new WeakMap<any, any>();

//
export const getType = (element)=>{
    let type: string = typeof element;
    if (Array.isArray(element)) type = "array";
    return type;
}

//
export const getDesc = (element, type)=>{
    let desc = Descriptions.get(element);
    if (!desc) {
        desc = {
            // reserved for UUID
            "@ref": null
        }
        Descriptions.set(element, desc);
    }

    //
    if (type) {
        desc["@type"] = type;
    }
}

//
export const wrapAsFunction = (desc, data = null)=>{
    const fn = function(){};
    fn["@desc"] = desc;
    fn["@data"] = data;
    return fn;
}

//
export const makeProxy = (handler, desc, data = null)=>{
    return new Proxy(wrapAsFunction(desc, data), handler);
}
