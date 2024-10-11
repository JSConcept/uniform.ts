// deno-lint-ignore-file no-explicit-any
//import moduleLoader, {doTransfer, getContext, ORG} from "../dist/uniform.js"; // 
import moduleLoader, {doTransfer, getContext, ORG} from "../index.ts";

//
const $module$ = new URL("./Worker.ts", import.meta.url).href;

//
const module = (await moduleLoader($module$)) as any;
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
