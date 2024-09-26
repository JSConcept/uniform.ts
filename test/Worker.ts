import ExChanger from "../src/FLOW/ExChanger";

//
export const Remote = new ExChanger(self);
await Remote.initialize();
Remote.register(class Tungst {
    static get lab() {
        return 5;
    }
}, "Tungst");
