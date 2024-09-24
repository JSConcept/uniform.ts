import UUIDMap from "../Utils/UUIDMap";

//
export default class ObjectPool {
    #objectPool: UUIDMap;

    //
    constructor() {
        this.#objectPool = new UUIDMap();
    }
}
