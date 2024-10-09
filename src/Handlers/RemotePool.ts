// deno-lint-ignore-file no-explicit-any
import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import { extract } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";

//
export const isSymbol = (sym: unknown)=>(typeof sym ==='symbol' || typeof sym == 'object' && Object.prototype.toString.call(sym) == '[object Symbol]');
export const FORBIDDEN_KEYS = new Set(["bind", "toString", "then", "catch", "finally"]);
export const META_KEYS = new Set(Array.from(Object.keys(ORG)));
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: ExChanger|null;

    //
    constructor(exChanger: ExChanger|null){
        super();
        this.#exChanger = exChanger;
    }

    //
    $data(t: unknown) { return extract(t); }
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        // return meta as is
        if (cmd == "get" && args[0] == ORG.data) { return this.$data(meta); };

        // forbidden actions
        if (cmd == "get" && (
            isSymbol(args?.[0]) ||
            FORBIDDEN_KEYS.has(args?.[0] as string) || 
            META_KEYS?.has?.(args?.[0] as string)
        )) { return null; };

        //
        return this.#exChanger?.$request(cmd, meta, args);
    }

    //
    $get(_: unknown|string|null): any { return null; };
}
