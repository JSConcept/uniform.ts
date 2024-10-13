// deno-lint-ignore-file no-explicit-any


export enum $ORG {
    type = "!#type#!",
    uuid = "!#uuid#!",
    node = "!#node#!",
    payload = "!#payload#!",
    index = "!#index#!",
    exc = "!#exc#!"
}

//
const $exc$ = Symbol("@exc");
const $data$ = Symbol("@data");
const $sync$ = Symbol("@sync");

//
export const ORG = {
    sync: $sync$,
    data: $data$,
    exc: $exc$,
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}


export interface IMeta {
    [$ORG.uuid]?: string;
    [$ORG.type]?: string;
    [$ORG.node]?: unknown;
    [$ORG.payload]?: unknown;
    [$ORG.index]?: number;
};

//
export default ORG;

/*@__MANGLE_PROP__*/ 
export const $bindings$ = /*@__MANGLE_PROP__*/ new WeakMap<any, any>();

/*@__MANGLE_PROP__*/ 
export const bindWithContext = (context: any, obj: any) => {
    try { context[ORG.exc] = obj; } catch(e: any) { console.warn(e); };
    $bindings$.set(context, obj);
    return obj;
}