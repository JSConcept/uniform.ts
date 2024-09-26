import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import {$data} from "../Instruction/InstructionType.ts"

//
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: ExChanger;

    //
    constructor(exChanger){
        super();
        this.#exChanger = exChanger;
    }

    //
    $data(t) {
        const wrap = t[$data] ?? t;
        return wrap?.["@uuid"] ? wrap : null;
    }

    //
    $handle(cmd, meta, ...args) {
        if (cmd == "get" && args[0] == $data) {
            return meta?.[$data];
        }

        //
        if (cmd == "get" && [
            "then", "catch", "finally", // promise forbidden
            "@uuid", "@type", "@payload", $data // organic forbidden
        ].indexOf(args[0]) >= 0) {
            return null;
        }

        //
        return this.$unwrap(meta, (ref)=>{
            if (ref) {
                return this.#exChanger.$request(cmd, ref, ...args);
            }
            return null;
        });
    }

    //
    $get(uuid): any { return null; };
}
