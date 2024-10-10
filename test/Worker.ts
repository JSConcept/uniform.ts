import { getContext, transfer } from "../src/ESM/Utils.ts";

//
const ctx = getContext(self);

// after sync you can register
export class Tungst {
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
export const regrets = new ArrayBuffer(64);
export const workerAction = async ()=>{
    //
    const transferCheck = await ctx["transferCheck"] as ((_: ArrayBuffer|unknown)=>unknown)|null;

    // (sending as argument, unusual here)
    const bravery = new ArrayBuffer(64);
    await (transferCheck?.(transfer(ctx, bravery)));

    // should to be detached
    console.warn(bravery);
}
