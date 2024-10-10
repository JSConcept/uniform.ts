// deno-lint-ignore-file no-explicit-any
import { extract } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";
import { IMeta } from "../Instruction/ObjectProxy.ts";

//
export default class DataHandler {
    constructor() {
    }

    //
    get $exChanger(): any { return null;};

    //
    $data(target: unknown|string|null) { return target; };
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        const ref = this.$data(meta);

        // any illegal is illegal (after 'then' or defer operation)...
        if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

        // needs to return itself
        if (cmd == "access") { return ref; }
        if (cmd == "transfer") {
            // sometimes, `@uuid` may already is known from memory pool
            const wrap = extract(meta) as IMeta;
            return {[ORG.type]: "transfer", [ORG.node]: ref, [ORG.uuid]: wrap?.[ORG.uuid] ?? ""}
        };

        //
        try {
            // @ts-ignore "no-idea"
            return Reflect?.[cmd]?.(ref, ...args);
        } catch(e) {
            const err = e as Error;

            //
            console.error("Wrong op: " + err.message);

            //
            console.error(err);
            console.trace(err);
        }

        //
        return ref;
    }

    //
    $get(_uuid: unknown|string|null): any { return null; };
}
