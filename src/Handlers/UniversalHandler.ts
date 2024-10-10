// deno-lint-ignore-file no-explicit-any
import DataHandler from "./DataHandler.ts";
import { extract, isPromise } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";
import { IMeta } from "../Instruction/ObjectProxy.ts";
import { isSymbol, FORBIDDEN_KEYS, META_KEYS } from "./DataHandler.ts";

//
export default class UniversalHandler extends DataHandler {
    #dataHandler: Map<string, DataHandler>;

    //
    constructor(dataHandler: Map<string, DataHandler> = new Map<string, DataHandler>()) {
        super();
        this.#dataHandler = dataHandler;
    }

    //
    get $exChanger() { return this.#dataHandler?.get?.("remote")?.$exChanger; }

    //
    $data(t: unknown | string | null): unknown {
        return (t as any)?.[ORG.data] ?? t;
    }

    //
    $addHandler(name: string, handler: DataHandler) { this.#dataHandler.set(name, handler); }
    $getHandler(name: string) { return this.#dataHandler.get(name); }

    //
    $handle(cmd = "access", t: any, ...args: unknown[]) {
        const data = this.$data(t);

        // isn't promise itself
        if (cmd == "get") {
            if (args[0] == ORG.data) { return data; };
            if (args[0] == ORG.exchanger) { return this.$exChanger; };
            if ( // forbidden actions
                isSymbol(args?.[0]) ||
                FORBIDDEN_KEYS.has(args?.[0] as string) || 
                META_KEYS.has?.(args?.[0] as any)
            ) { return null; };
        }

        //
        let htp = "direct";
        if (isPromise(data)) 
            { htp = "promise"; } else
            {
                const meta = (extract(t) as IMeta), local = this.$get(meta);
                const overlap = (extract(local) as any)?.[ORG.uuid] == (meta as any)?.[ORG.uuid];

                //
                if (typeof (meta as any)?.[ORG.type] == "string") { htp = "local"; }
                if (typeof (meta as any)?.[ORG.uuid] == "string" && (!local || overlap)) { htp = "remote"; }
            }

        //
        return this.#dataHandler?.get(htp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid: unknown|string|null) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}
