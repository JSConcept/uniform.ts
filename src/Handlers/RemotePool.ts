// deno-lint-ignore-file no-explicit-any
import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import ORG, { extract, isSymbol, FORBIDDEN_KEYS, META_KEYS } from "../Instruction/InstructionType.ts";

//
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
    $data(t: unknown) { return extract(t) ?? t; }
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        const data = this.$data(meta);

        // return meta as is
        if (cmd == "get") {
            if (args[0] == ORG.data) { return data; };
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
