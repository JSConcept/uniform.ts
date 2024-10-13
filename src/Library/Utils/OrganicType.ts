// deno-lint-ignore-file no-explicit-any

/*@__PURE__*/
export enum $ORG {
    /*@__PURE__*/ type = "!#type#!",
    /*@__PURE__*/ uuid = "!#uuid#!",
    /*@__PURE__*/ node = "!#node#!",
    /*@__PURE__*/ payload = "!#payload#!",
    /*@__PURE__*/ index = "!#index#!",
    /*@__PURE__*/ exc = "!#exc#!"
}

//
/*@__PURE__*/ const $exc$ = Symbol("@exc");
/*@__PURE__*/ const $data$ = Symbol("@data");
/*@__PURE__*/ const $sync$ = Symbol("@sync");

//
/*@__PURE__*/ export const ORG = {
    /*@__PURE__*/ sync: $sync$,
    /*@__PURE__*/ data: $data$,
    /*@__PURE__*/ exc: $exc$,
    /*@__PURE__*/ type: $ORG.type,
    /*@__PURE__*/ uuid: $ORG.uuid,
    /*@__PURE__*/ node: $ORG.node,
    /*@__PURE__*/ payload: $ORG.payload,
    /*@__PURE__*/ index: $ORG.index
}

/*@__PURE__*/
export interface IMeta {
    /*@__PURE__*/ [$ORG.uuid]?: string;
    /*@__PURE__*/ [$ORG.type]?: string;
    /*@__PURE__*/ [$ORG.node]?: unknown;
    /*@__PURE__*/ [$ORG.payload]?: unknown;
    /*@__PURE__*/ [$ORG.index]?: number;
};

//
/*@__PURE__*/ export default ORG;
/*@__PURE__*/ export const $bindings$ = new WeakMap<any, any>();
/*@__PURE__*/ export const bindWithContext = (context: any, obj: any) => {
    try { context[ORG.exc] = obj; } catch(e: any) { console.warn(e); };
    $bindings$.set(context, obj);
    return obj;
}