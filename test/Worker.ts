import ExChanger from "../src/FLOW/ExChanger";

//
export const Remote = new ExChanger(self);
await Remote.initialize();
Remote.register(class Tungst {
    clips: number;
    constructor() {
        console.log("Chips");
        this.clips = 0;
    }
    static get lab() {
        return 5;
    }
    callback(n = 0) {
        console.log("Crispy:" + (this.clips + n));
    }
}, "Tungst");
