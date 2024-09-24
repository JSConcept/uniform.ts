export default class ObjectPoolMemberHandler {
    #memoryPoolHandler: any;

    //
    constructor(memoryPoolHandler){
        this.#memoryPoolHandler = memoryPoolHandler;
    }

    //
    #deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }

    //
    #data(target) {
        return this.#deferOp(target, (t)=>{
            const wrap = t["@data"] ?? t;
            return t ? wrap?.["@uuid"] : this.#memoryPoolHandler.get(wrap?.["@uuid"])?.defer?.();
        });
    }

    //
    $handle(cmd, meta, ...args) {
        const ref = this.#data(meta);
        return this.#deferOp(ref, (data)=>{
            /*switch(cmd) {
                switch("get") {
                }
                default:
            }*/
            return Reflect[cmd](data, ...args);
        });
    }
}
