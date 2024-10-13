// deno-lint-ignore-file no-explicit-any
/*@__PURE__*/ import { isSymbol, FORBIDDEN_KEYS, META_KEYS } from "../Utils/Useful.ts";
/*@__PURE__*/ import { extract } from "../Utils/InstructionType.ts";
/*@__PURE__*/ import ORG from "../Utils/OrganicType.ts";

//
/*@__PURE__*/ import DataHandler from "./DataHandler.ts";

//
/*@__PURE__*/ export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: any|null;

    //
    constructor(exChanger: any|null){
        super();
        this.#exChanger = exChanger;
    }

    //
    /*@__PURE__*/ get /*@__PURE__*/ $exc() { return this.#exChanger; }

    //
    /*@__PURE__*/ $data(t: unknown) { return extract(t) ?? t; }
    /*@__PURE__*/ $hnd(cmd: string, meta: unknown, ...args: unknown[]) {
        const data: any = /*@__PURE__*/ this.$data(meta);

        // return meta as is
        if (cmd == "get") {
            if (args[0] == ORG.data) { return data; };
            if (args[0] == ORG.exc) { return this.$exc ?? data?.[ORG.exc] ?? data?.then?.((e: any)=>e?.[ORG.exc]) ?? null; };
            if ( // forbidden actions
                isSymbol(args?.[0]) ||
                FORBIDDEN_KEYS.has(args?.[0] as string) || 
                META_KEYS.has?.(args?.[0] as any)
            ) { return null; };
        }

        //
        return this.#exChanger?.$request(cmd, meta, args);
    }

    //
    /*@__PURE__*/ $get(_: unknown|string|null): any { return null; };
}
