// deno-lint-ignore-file no-explicit-any
import ExChanger from "../src/FLOW/ExChanger.ts";

// @ts-ignore "mixed context"
const isWorker = typeof Worker == "undefined" || typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope;
const testWorker = !isWorker ? new Worker(new URL("./Worker.ts", import.meta.url).href, {type: "module"}) : self;

//
export const Host = new ExChanger(testWorker)


await Host.initialize();

//
const transferCheck = (ab: any)=>{ console.log(ab); };
const hostAction = async ()=>{
    //
    const Tungst: any = Host.access("Tungst");
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
const workerAction = (await Host.access("workerAction")) as (()=>unknown)|null;

//
await hostAction();
await workerAction?.();
