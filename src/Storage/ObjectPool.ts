import UUIDMap from "../Import/utils/UUIDMap";

//
export default class ObjectPool {
    #objectPool: UUIDMap;

    //
    constructor() {
        this.#objectPool = new UUIDMap();
    }
}
