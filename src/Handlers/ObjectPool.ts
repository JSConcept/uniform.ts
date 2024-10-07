import UUIDMap, {hold} from "../Utils/UUIDMap.ts";
import DataHandler from "./DataHandler.ts";
import { extract } from "../Instruction/Defer.ts";

//
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: UUIDMap | null;

    //
    constructor(memoryPool: UUIDMap | null = new UUIDMap()){
        super();
        this.#memoryPool = memoryPool;
    }

    // there is may not be meta object
    $data(t: unknown|string|null): any {
        return super.$data((()=>{
            const wrap = extract(t) ?? t;
            const uuid = wrap?.["@uuid"] ?? wrap;
            if (typeof uuid == "string") {
                const weak: any = this.#memoryPool?.get(uuid);
                return (hold(weak?.deref?.()) ?? weak) ?? t;
            }
            return t;
        })());
    }

    //
    $get(t: unknown|string|null): any {
        const wrap = extract(t) ?? t;
        const uuid = wrap?.["@uuid"] ?? wrap;
        if (typeof uuid == "string") {
            const weak: any = this.#memoryPool?.get(uuid);
            return hold(weak?.deref?.()) ?? weak ?? null;
        }
        return null;
    };
}
