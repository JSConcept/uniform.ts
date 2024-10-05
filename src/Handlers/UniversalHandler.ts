import DataHandler from "./DataHandler.ts";
import { extract } from "../Instruction/Defer.ts";

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
        const meta  = extract(t);
        const local = this.$get(meta);
        const tp    = (local && (typeof local != "string") && (extract(local)?.["@uuid"] != meta?.["@uuid"])) ? "local" : (typeof meta?.["@type"] == "string" ? "remote" : "promise");
        return this.#dataHandler?.get(tp)?.$handle?.(cmd, t, ...args);
    }

    //
    $get(uuid) { return this.#dataHandler.get("local")?.$get?.(uuid); };
}
