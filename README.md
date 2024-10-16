# 🏬 Uniform.TS 🏬

Replacement of all my web workers libraries.

The project is being revived, but I can't give a full guarantee yet.

Just had some new thoughts about him. New architectural sketches.

The whole idea is not based on some organic principles.

## Test Code

Host code:

```ts
// deno-lint-ignore-file no-explicit-any
import moduleLoader, {doTransfer, getContext, sync} from "../dist/uniform.js"; // 
//import moduleLoader, {doTransfer, getContext, ORG} from "../src/index.ts";

// typescript modules doesn't supported directly...
const module = (await (moduleLoader( new URL("./Worker.mjs", import.meta.url).href )?.catch?.(console.trace.bind(console)))) as any;
const ctx = getContext(module);
if (!ctx) throw new Error("Invalid context or worker...");

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
await ctx[sync];

//
const workerAction = (await module?.workerAction);

//
await hostAction();
await workerAction?.();
```

ES module for worker context:

```js
//
let ctx = {}, utils = {}; export const importContext = ($ctx, $utils)=>(ctx = $ctx, utils = $utils);

// after sync you can register
export class TestClass {
    //clips: number;
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
    const transferCheck = await ctx?.["transferCheck"]; //as ((_: ArrayBuffer|unknown)=>unknown)|null;

    // (sending as argument, unusual here)
    const bravery = new ArrayBuffer(64);
    await (transferCheck?.(utils.transfer(ctx, bravery)));

    // should to be detached
    console.warn(bravery);
}
```
