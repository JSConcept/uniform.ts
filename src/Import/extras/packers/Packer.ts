import {AM} from "../accessor/AccessModule.ts";
import {getType, getDesc, makeProxy} from "../proxies/Definition.ts";

//
export const unpack = (element, deps: any = {}) => {
    const type = getType(element);
    const desc = getDesc(element, type) ?? element;

    //
    switch(type) {
        // objects....
        case "object":
        case "function":
        const exists = AM.objectMap.get(element);
        if (exists) return exists;
        return makeProxy(deps.remoteHandle, element);

        //
        case "array":
            return element.map((el)=>unpack(el, deps));
        break;

        //
        default:
            return element;
    };
}

//
const packInline = (element, transfer = [], deps: any = {}): any=>{
    const type = getType(element);
    const desc = getDesc(element, type);

    //
    switch(type) {
        // objects....
        case "object":
        case "function":
            desc["@ref"] = AM.objectMap.add(element);
        return desc;

        //
        case "array":
            const array = element.map((el)=>pack(el, transfer, deps));
            if (array.some((el)=>(el instanceof Promise || el?.then == "function"))) {
                return Promise.all(array);
            }
            return array;
        break;

        // primitive...
        default:
        return element;
    }
}

//
export const pack = (element, transfer = [], deps = {})=>{
    if (element instanceof Promise || element?.then == "function") {
        return element.then((el)=>packInline(el, transfer, deps));
    }
    return packInline(element, transfer, deps);
}
