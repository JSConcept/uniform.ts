// deno-lint-ignore-file no-explicit-any
/*@__PURE__*/ import UUIDMap from "../Utils/UUIDMap.ts";
/*@__PURE__*/ import { ORG }  from "../Utils/OrganicType.ts";
/*@__PURE__*/ import { extract } from "../Utils/InstructionType.ts";

//
/*@__PURE__*/ import DataHandler from "./DataHandler.ts";

/*@__PURE__*/ 
export default class ObjectPoolMemberHandler extends DataHandler {
    #memoryPool: UUIDMap | null;

    //
    constructor(memoryPool: UUIDMap | null = new UUIDMap()){
        super();
        this.#memoryPool = memoryPool;
    }

    // there is may not be meta object
    /*@__PURE__*/ $data(t: unknown|string|null): any {
        return /*@__PURE__*/ super.$data((()=>{
            const wrap = (extract(t) ?? t) as any;
            const uuid = (wrap as any)?.[ORG.uuid] ?? wrap ?? t;
            if (typeof uuid == "string") {
                return this.#memoryPool?.get(uuid) ?? t;
            }
            return t;
        })());
    }

    //
    /*@__PURE__*/ $get(t: unknown|string|null): any {
        const wrap = (extract(t) ?? t) as any;
        const uuid = ((wrap as any)?.[ORG.uuid] ?? wrap) as string ?? t;
        if (typeof uuid == "string") {
            return this.#memoryPool?.get(uuid);
        }
        return null;
    };
}
