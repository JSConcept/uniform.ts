export default class DataHandler {
    constructor() {
    }

    //
    #data(target) {
        return this.$deferOp(target, (e)=>e);
    }

    //
    $deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }

    //
    $handle(cmd, ref, ...args) {
        return this.$deferOp(ref, (data)=>{
            const ref = this.#data(data);
            if (cmd == "access") return ref;
            return Reflect[cmd](ref, ...args);
        });
    }
}