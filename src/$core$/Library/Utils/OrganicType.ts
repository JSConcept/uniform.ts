// deno-lint-ignore-file no-explicit-any

/*@__PURE__*/ export enum $ORG {
    type = "!#type#!",
    uuid = "!#uuid#!",
    node = "!#node#!",
    payload = "!#payload#!",
    index = "!#index#!",
    exc = "!#exc#!"
}

//
/*@__MANGLE_PROP__*/ const $exc$  = /*@__MANGLE_PROP__*/ Symbol("@exc");
/*@__MANGLE_PROP__*/ const $data$ = /*@__MANGLE_PROP__*/ Symbol("@data");
/*@__MANGLE_PROP__*/ const $sync$ = /*@__MANGLE_PROP__*/ Symbol("@sync");

/*@__MANGLE_PROP__*/ 
export const ORG = {
    /*@__MANGLE_PROP__*/ sync: $sync$,
    /*@__MANGLE_PROP__*/ exc: $exc$,
    data: $data$,
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}

/*@__PURE__*/ export interface IMeta {
    [$ORG.uuid]?: string;
    [$ORG.type]?: string;
    [$ORG.node]?: unknown;
    [$ORG.payload]?: unknown;
    [$ORG.index]?: number;
};

//
/*@__MANGLE_PROP__*/ /*@__PURE__*/ export default ORG;
/*@__MANGLE_PROP__*/ /*@__PURE__*/ export const $bindings$ = /*@__MANGLE_PROP__*/ new WeakMap<any, any>();
/*@__MANGLE_PROP__*/ /*@__PURE__*/ export const bindWithContext = (context: any, obj: any) => {
    try { context[ORG.exc] = obj; } catch(e: any) { console.warn(e); };
    /*@__MANGLE_PROP__*/ /*@__PURE__*/ $bindings$.set(context, obj);
    return obj;
}
