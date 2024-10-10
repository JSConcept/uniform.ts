// deno-lint-ignore-file no-explicit-any
import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import { extract } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";

//
export const isSymbol = (sym: unknown)=>(typeof sym ==='symbol' || typeof sym == 'object' && Object.prototype.toString.call(sym) == '[object Symbol]');
export const FORBIDDEN_KEYS = new Set(["bind", "toString", "then", "catch", "finally"]);
export const META_KEYS = new Set(Array.from(Object.values(ORG)));
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: ExChanger|null;

    //
    constructor(exChanger: ExChanger|null){
        super();
        this.#exChanger = exChanger;
    }

    //
    get $exChanger() { return this.#exChanger; }

    //
    $data(t: unknown) { return extract(t); }
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        // return meta as is
        if (cmd == "get") {
            if (args[0] == ORG.data) { return this.$data(meta); };
            if (args[0] == ORG.exchanger) { return this.#exChanger; };
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
    $get(_: unknown|string|null): any { return null; };
}
