// deno-lint-ignore-file no-explicit-any 
import ORG, { extract, FORBIDDEN_KEYS, META_KEYS, isSymbol, type IMeta  } from "../Utils/InstructionType.ts";

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

        // return meta as is
        if (cmd == "get") {
            if (args[0] == ORG.data) { return ref; };
            if (args[0] == ORG.exchanger) { return this.$exChanger; };
            if ( // forbidden actions
                isSymbol(args?.[0]) ||
                FORBIDDEN_KEYS.has(args?.[0] as string) || 
                META_KEYS.has?.(args?.[0] as any)
            ) { return null; };
        }

        // needs to return itself
        if (cmd == "access") { return ref; }
        if (cmd == "transfer") {
            // sometimes, `@uuid` may already is known from memory pool
            const wrap = extract(meta) as IMeta;
            return {
                [ORG.type]: "transfer", 
                [ORG.node]: ref, 
                [ORG.uuid]: (wrap as any)?.[ORG.uuid] ?? ""
            };
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
