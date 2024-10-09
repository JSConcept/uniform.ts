import ExChanger from "../src/FLOW/ExChanger.ts";

// initialize ex-changer
export const Remote = new ExChanger(self);
await Remote.initialize();

// after sync you can register
class Tungst {
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
}

// after, prefers sync with receiver
const regrets = new ArrayBuffer(64);
const workerAction = async ()=>{
    //
    const transferCheck = Remote.access("transferCheck") as ((_: ArrayBuffer|unknown)=>unknown)|null;

    // (sending as argument, unusual here)
    const bravery = new ArrayBuffer(64);
    await transferCheck?.(Remote.transfer(bravery));

    // should to be detached
    console.warn(bravery);
}

//
await Remote.sync();

//
Remote.register(Tungst, "Tungst");
Remote.register(regrets, "regrets");
Remote.register(workerAction, "workerAction");

//
await Remote.sync();
