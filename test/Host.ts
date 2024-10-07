import ExChanger from "../src/FLOW/ExChanger.ts";

//
export const Host = new ExChanger(new Worker(new URL("./Worker.ts", import.meta.url).href, {type: "module"}))
await Host.initialize();

//
const transferCheck = (ab)=>{ console.log(ab); };
const hostAction = async ()=>{
    //
    const Tungst = Host.access("Tungst");
    console.log(await Tungst.lab);

    //
    const tgn = (new Tungst());
    await tgn?.callback?.(6);

    //
    console.log(await Host.transfer("regrets"));
}

//
await Host.sync();

//
Host.register(transferCheck, "transferCheck");
Host.register(hostAction, "hostAction");

//
await Host.sync();

//
const workerAction = await Host.access("workerAction");

//
await hostAction();
await workerAction();
