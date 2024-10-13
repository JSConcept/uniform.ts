// deno-lint-ignore-file no-explicit-any
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
const $exchanger$ = Symbol("@exchanger");
const $data$ = Symbol("@data");
const $sync$ = Symbol("@sync");

// 
export const ORG = {
    sync: $sync$,
    data: $data$,
    exchanger: $ORG.exchanger,//$exchanger$,
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}

//
export interface IMeta {
    [$ORG.uuid]?: string;
    [$ORG.type]?: string;
    [$ORG.node]?: unknown;
    [$ORG.payload]?: unknown;
    [$ORG.index]?: number;
};

//
export default ORG;

//
export const $bindings$ = new WeakMap<any, any>();
export const bindWithContext = (context: any, obj: any) => {
    try { context[ORG.exchanger] = obj; } catch(e: any) { console.warn(e); };
    $bindings$.set(context, obj);
    return obj;
}