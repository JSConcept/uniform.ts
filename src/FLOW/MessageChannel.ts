import DataHandler from "../Handlers/DataHandler.ts";
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import PreCoding from "../PreCoding/PreCoding";

//
export default class MessageChannel {
    #dataHandler: DataHandler = new UniversalHandler();
    #coders: PreCoding = new PreCoding();

    //
    constructor(dataHandler = new UniversalHandler()) {
        this.#dataHandler = dataHandler;
    }

    //
    $memoryPool() {
        return this.#coders.memoryPool;
    }

    //
    $handler(command) {
        const {cmd, uuid, dir, args: [[target, ...args], transfer]} = command;

        // before you needs decode its
        const result = this.#dataHandler.$handle(cmd, target, transfer);
        return [this.#coders.encode(result, transfer), transfer] // also, needs to recode back
    }

    //
    $resolver(command) {
        const transfer = [];
        const {cmd, uuid, dir, result} = command;
        return this.#coders.decode(result, transfer); // also, needs to decode
    }
}
