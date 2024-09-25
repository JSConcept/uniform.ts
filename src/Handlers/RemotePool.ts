import ObjectProxy from "../Instruction/ObjectProxy.ts";
import DataHandler from "./DataHandler.ts";

//
export default class RemoteReferenceHandler extends DataHandler {
    #exChanger: any;

    //
    constructor(exChanger){
        super();
        this.#exChanger = exChanger;
    }

    //
    $data(target) {
        return this.$deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            return wrap?.["@uuid"];//wrap?.["@uuid"] ? this.#exhcnager.get(wrap?.["@uuid"])?.defer?.() : null;
        });
    }

    //
    $handle(cmd, meta, ...args) {
        return this.$deferOp(meta, (data)=>{
            return this.#exChanger.$request(cmd, this.$data(data), ...args);
        });
    }

    //
    $get(uuid) { return null; };
}

//
export const wrapRemote = (meta, handler: RemoteReferenceHandler)=>{
    return new Proxy(meta, new ObjectProxy(handler))
}
