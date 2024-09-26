import UUIDMap from "../Utils/UUIDMap.ts";
import DataHandler from "./DataHandler.ts";
import {$data} from "../Instruction/InstructionType.ts"

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: UUIDMap;

    //
    constructor(memoryPool = new UUIDMap()){
        super();
        this.#memoryPool = memoryPool;
    }

    // there is may not be meta object
    $data(t) {
        const wrap = t[$data] ?? t;
        if (typeof (wrap?.["@uuid"] ?? wrap) == "string") {
            const weak = this.#memoryPool.get(wrap?.["@uuid"] ?? wrap);
            return weak?.deref?.() ?? weak;
        }
        return wrap;
    }

    //
    $get(t): any {
        const wrap = t[$data] ?? t;
        if (typeof (wrap?.["@uuid"] ?? wrap) == "string") {
            const weak = this.#memoryPool.get(wrap?.["@uuid"] ?? wrap);
            return weak?.deref?.() ?? weak;
        }
        return null;
    };
}
