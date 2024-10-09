// deno-lint-ignore-file no-explicit-any
import DataHandler from "./DataHandler.ts";
import { extract, isPromise } from "../Instruction/Defer.ts";
import ORG from "../Instruction/InstructionType.ts";

//
export default class UniversalHandler extends DataHandler {
    #dataHandler: Map<string, DataHandler>;

    //
    constructor(dataHandler: Map<string, DataHandler> = new Map<string, DataHandler>()) {
        super();
        this.#dataHandler = dataHandler;
    }

    //
    $addHandler(name: string, handler: DataHandler) { this.#dataHandler.set(name, handler); }
    $getHandler(name: string) { return this.#dataHandler.get(name); }

    //
    $handle(cmd = "access", t: any, ...args: unknown[]) {
        //
        let htp = "direct";
        if (isPromise(t?.[ORG.data] ?? t)) 
            { htp = "promise"; } else
            {
                const meta = extract(t), local = this.$get(meta);
                if (typeof meta?.[ORG.type] == "string") { htp = "local"; }
                if (typeof meta?.[ORG.uuid] == "string" && !(local && extract(local)?.[ORG.uuid] != meta?.[ORG.uuid])) { htp = "remote"; }
            }

        //
        return this.#dataHandler?.get(htp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid: unknown|string|null) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}
