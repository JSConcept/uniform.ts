import UUIDMap from "../Utils/UUIDMap.ts";
import DataHandler from "./DataHandler.ts";
import { extract } from "./UniversalHandler";

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: UUIDMap | null;

    //
    constructor(memoryPool: UUIDMap | null = new UUIDMap()){
        super();
        this.#memoryPool = memoryPool;
    }

    // there is may not be meta object
    $data(t): any {
        return super.$data((()=>{
            const wrap = extract(t) ?? t;
            const uuid = wrap?.["@uuid"] ?? wrap;
            if (typeof uuid == "string") {
                const weak: any = this.#memoryPool?.get(uuid);
                return (weak?.deref?.() ?? weak) ?? t;
            }
            return t;
        })());
    }

    //
    $get(t): any {
        const wrap = extract(t) ?? t;
        const uuid = wrap?.["@uuid"] ?? wrap;
        if (typeof uuid == "string") {
            const weak: any = this.#memoryPool?.get(uuid);
            return weak?.deref?.() ?? weak ?? null;
        }
        return null;
    };
}
