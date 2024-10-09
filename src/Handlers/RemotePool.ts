// deno-lint-ignore-file no-explicit-any
import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import { extract } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";

//
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
        if (cmd == "get" && args[0] == ORG.data) {
            return this.$data(meta);
        };

        //
        if (cmd == "get" &&
            (
            typeof args[0] === 'symbol' || typeof args[0] === 'object' && Object.prototype.toString.call(args[0]) === '[object Symbol]' ||
            ["bind", "toString", "then", "catch", "finally"].indexOf(args?.[0] as any) >= 0 ||
            // @ts-ignore "no valid type"
            new Set(Array.from(Object.keys(ORG))).has(args?.[0])
        )
        ) {
            return null;
        }

        //
        return this.#exChanger?.$request(cmd, meta, args);
    }

    //
    $get(_: unknown|string|null): any { return null; };
}
