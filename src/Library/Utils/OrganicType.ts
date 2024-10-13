// deno-lint-ignore-file no-explicit-any

/*@__PURE__*/
export enum $ORG {
    type = "!#type#!",
    uuid = "!#uuid#!",
    node = "!#node#!",
    payload = "!#payload#!",
    index = "!#index#!",
    exchanger = "!#exchanger#!"
}

//
/*@__PURE__*/ const $exchanger$ = Symbol("@exchanger");
/*@__PURE__*/ const $data$ = Symbol("@data");
/*@__PURE__*/ const $sync$ = Symbol("@sync");

//
/*@__PURE__*/ export const ORG = {
    sync: $sync$,
    data: $data$,
    exchanger: $exchanger$,
    type: $ORG.type,
    uuid: $ORG.uuid,
    node: $ORG.node,
    payload: $ORG.payload,
    index: $ORG.index
}

/*@__PURE__*/
export interface IMeta {
    [$ORG.uuid]?: string;
    [$ORG.type]?: string;
    [$ORG.node]?: unknown;
    [$ORG.payload]?: unknown;
    [$ORG.index]?: number;
};

//
/*@__PURE__*/ export default ORG;
/*@__PURE__*/ export const $bindings$ = new WeakMap<any, any>();
/*@__PURE__*/ export const bindWithContext = (context: any, obj: any) => {
    try { context[ORG.exchanger] = obj; } catch(e: any) { console.warn(e); };
    $bindings$.set(context, obj);
    return obj;
}