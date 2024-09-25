import DataHandler from "../Handlers/DataHandler";
import UniversalHandler from "../Handlers/UniversalHandler";

//
export default class MessageChannel {
    #dataHandler: DataHandler = new UniversalHandler();

    //
    constructor() {
        this.#dataHandler = new UniversalHandler();
    }

    //
    $handler(command) {
        const {cmd, uuid, dir, args: [[target, ...args], transfer]} = command;

        // before you needs decode its
        const result = this.#dataHandler.$handle(cmd, target, ...args);
        return [result, transfer] // also, needs to recode back
    }

    //
    $resolver(command) {
        const {cmd, uuid, dir, result} = command;
        return result; // also, needs to decode
    }
}
