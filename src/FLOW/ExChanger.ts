import UniversalHandler, { wrapMeta } from "../Handlers/UniversalHandler";
import FLOW, { type WorkerContext } from "./FLOW";
import RemoteReferenceHandler from "../Handlers/RemotePool";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool";
import DataHandler from "../Handlers/DataHandler";
import UUIDMap from "../Utils/UUIDMap";

//
export default class ExChanger {
    #flow: FLOW | null = null;
    #handler: UniversalHandler | null;
    #memoryPool = new UUIDMap();

    //
    constructor(context: WorkerContext, handler: UniversalHandler = new UniversalHandler()){
        this.#flow = new FLOW(context);
        this.#handler = handler;
    }

    //
    async initialize() {
        await this.#flow?.importToUnit("./MessageChannel.ts");
        await this.#flow?.importToSelf(import("./MessageChannel"));

        //
        this.#handler?.$addHandler("local", new ObjectPoolMemberHandler(this.#memoryPool = this.#flow?.$memoryPool()));
        this.#handler?.$addHandler("remote", new RemoteReferenceHandler(this));
        this.#handler?.$addHandler("promise", new DataHandler());
    }

    //
    get $imports() {
        return this.#flow?.$imports || {};
    }

    //
    $request(cmd: string, meta: any, ...args : any[]) {
        const result = this.#flow?.callTask?.([cmd, meta, ...args], []);
        return wrapMeta(result, this.#handler || new UniversalHandler());
    }

    //
    $importToUnit(source) { return this.#flow?.importToUnit(source); }
    $importToSelf(module) { return this.#flow?.importToSelf(module); }
}
