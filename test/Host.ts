// deno-lint-ignore-file no-explicit-any
import moduleLoader from "../src/ESM/ModuleLoader.ts";
import {doTransfer, getContext} from "../src/ESM/Utils.ts";
import ORG from "../src/Instruction/InstructionType.ts";

//
const module = (await moduleLoader(new URL("./Worker.ts", import.meta.url).href)) as any;
const ctx = getContext(module);

//
const transferCheck = (ab: any)=>{ console.log(ab); };
const hostAction = async ()=>{
    // @ts-ignore ""
    const TestClass: any = module.TestClass;
    console.log(await TestClass.lab);

    //
    const tgn = (new TestClass());
    await tgn?.callback?.(6);

    // get arrayBuffer from context registry
    console.log(await doTransfer(ctx, "", module?.regrets));
}

// set context extras (visible in worker)
ctx["transferCheck"] = transferCheck;
ctx["hostAction"] = hostAction;

// synchronize
await ctx[ORG.sync];

//
const workerAction = (await module?.workerAction);

//
await hostAction();
await workerAction?.();
