export default class ObjectHandler {
    #dataHandler: any;

    //
    constructor(dataHandler = {}) {
        this.#dataHandler = dataHandler;
    }

    //
    $handle(name = "access", target, ...args) {
        return this.#deferOp(target, (t)=>{
            return this.#dataHandler.$handle(name, t, args);
        });
    }

    //
    #deferOp(target, cb) {
        if (target?.then != null) {
            return target?.then?.(cb);
        } else {
            return cb(target);
        }
    }
}
