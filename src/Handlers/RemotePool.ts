import ExChanger from "../FLOW/ExChanger.ts";
import DataHandler from "./DataHandler.ts";
import {$data} from "../Instruction/InstructionType.ts"
import { extract } from "../Instruction/Defer.ts";

//
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: ExChanger;

    //
    constructor(exChanger){
        super();
        this.#exChanger = exChanger;
    }

    //
    $data(t) { return extract(t); }
    $handle(cmd, meta, ...args) {
        if (cmd == "get" && args[0] == $data) {
            return this.$data(meta);
        };

        //
        if (cmd == "get" &&
            (typeof args[0] === 'symbol' || typeof args[0] === 'object' && Object.prototype.toString.call(args[0]) === '[object Symbol]') ||
            [
                "bind", "toString", // system accessors are forbidden!

                "then", "catch", "finally", // promise forbidden
                "@uuid", "@type", "@payload", "@node", $data // organic forbidden
            ].indexOf(args[0]) >= 0
        ) {
            return null;
        }

        //
        return this.#exChanger.$request(cmd, meta, ...args);
    }

    //
    $get(_): any { return null; };
}
