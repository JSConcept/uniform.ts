// deno-lint-ignore-file no-explicit-any
import DataHandler from "./DataHandler.ts";
import { extract, isPromise } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";
import { IMeta } from "../Instruction/ObjectProxy.ts";

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
    $addHandler(name: string, handler: DataHandler) { this.#dataHandler.set(name, handler); }
    $getHandler(name: string) { return this.#dataHandler.get(name); }

    //
    $handle(cmd = "access", t: any, ...args: unknown[]) {
        if (cmd == "get" && args[0] == ORG.exchanger) { return this.$exChanger; };

        //
        let htp = "direct";
        if (isPromise(t?.[ORG.data] ?? t)) 
            { htp = "promise"; } else
            {
                const meta = extract(t) as IMeta, local = this.$get(meta);
                if (typeof (meta as any)?.[ORG.type] == "string") { htp = "local"; }
                if (typeof (meta as any)?.[ORG.uuid] == "string" && !(local && (extract(local) as any)?.[ORG.uuid] != (meta as any)?.[ORG.uuid])) { htp = "remote"; }
            }

        //
        return this.#dataHandler?.get(htp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid: unknown|string|null) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}
