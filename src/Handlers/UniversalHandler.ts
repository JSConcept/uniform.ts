import DataHandler from "./DataHandler.ts";
import { extract, isPromise } from "../Instruction/Defer.ts";
import { $data, MakeReference} from "../Instruction/InstructionType.ts"

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
    $handle(cmd = "access", t, ...args) {
        //
        let htp = "direct";
        if (isPromise(t?.[$data] ?? t)) 
            { htp = "promise"; } else
            {
                const meta = extract(t), local = this.$get(meta);
                if (typeof meta?.["@type"] == "string") { htp = "local"; }
                if (typeof meta?.["@uuid"] == "string" && !(local && extract(local)?.["@uuid"] != meta?.["@uuid"])) { htp = "remote"; }
            }

        //
        return this.#dataHandler?.get(htp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}
