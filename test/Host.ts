// deno-lint-ignore-file no-explicit-any
import moduleLoader from "../src/ESM/ModuleLoader.ts";
import {doTransfer, getContext} from "../src/ESM/Utils.ts";
import ORG from "../src/Instruction/InstructionType.ts";

//
const module = await moduleLoader(new URL("./Worker.ts", import.meta.url).href);
const ctx = getContext(module);

//
const transferCheck = (ab: any)=>{ console.log(ab); };
const hostAction = async ()=>{
    // @ts-ignore ""
    const Tungst: any = module.Tungst;
    console.log(await Tungst.lab);

    //
    const tgn = (new Tungst());
    await tgn?.callback?.(6);

    // get arrayBuffer from registry
    console.log(await doTransfer(ctx, "", module["regrets"]));
}

//
ctx["transferCheck"] = transferCheck;
ctx["hostAction"] = hostAction;

// synchronize
await ctx[ORG.sync];

//
const workerAction = (await module?.workerAction) as (()=>unknown)|null;

//
await hostAction();
await workerAction?.();
