// deno-lint-ignore-file ban-types no-explicit-any no-explicit-any ban-types no-explicit-any no-explicit-any
import { ORG, type IMeta } from "./OrganicType.ts";
import { doOnlyAfterResolve, IWrap, MPromise } from "./Useful.ts";

/*@__MANGLE_PROP__*/ 
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
        /*@__MANGLE_PROP__*/ /*@__PURE__*/ fx.prototype.stringify = function (){ return JSON.stringify(this[ORG.data] || "{}"); }
        /*@__MANGLE_PROP__*/ /*@__PURE__*/ fx.stringify = ()=>{ return JSON.stringify(data || "{}"); }

        // @ts-ignore "typescript not supports Symbol"
        fx[ORG.data] = data;
    }

    //
    return fx;
}

// any meta contains, and can't to be primitive or array directly
// only constructor, function, or object
/*@__MANGLE_PROP__*/ 
export const bindCtx = (gt: any, ref: any|null = null)=>{
    if (typeof gt == "function" && typeof gt?.bind == "function" && (typeof ref == "object" || typeof ref == "function")) {
        // may be organic or context detached
        return gt?.bind?.(ref) ?? gt;
    }
    return gt;
}

/*@__MANGLE_PROP__*/ 
export const wrapWeakMap = /*@__MANGLE_PROP__*/ new WeakMap([]);

/*@__MANGLE_PROP__*/ 
export const prepare = <T extends unknown>(w: IWrap<T>|T|IMeta): any => {
    return doOnlyAfterResolve(w, (wrap: any)=>{
        if (wrap?.[ORG.data]) return wrap?.[ORG.data];
        const organic = wrapWeakMap.get(wrap) ?? wrap;
        return organic?.[ORG.data] ?? organic;
    });
}

/*@__MANGLE_PROP__*/ 
export const redirect = <T extends unknown>(w: IWrap<T>|MPromise<T>|MPromise<IMeta>): MPromise<IMeta> =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.[ORG.uuid]||pt?.[ORG.type]) as string|null)?pt:null;
    });
}

/*@__MANGLE_PROP__*/ 
export const extract = <T extends unknown>(w: IWrap<T>|MPromise<T>|MPromise<IMeta>): MPromise<IMeta> =>{
    return doOnlyAfterResolve(w, (wrap: any)=>{
        const pt = prepare(wrap);
        return ((pt?.[ORG.uuid]||pt?.[ORG.type] as string|null))?pt:null;
    });
}
