# 🏬 Uniform.TS 🏬

Replacement of all my web workers libraries.

The project is being revived, but I can't give a full guarantee yet.

Just had some new thoughts about him. New architectural sketches.

The whole idea is not based on some organic principles.

## Test Code

Host code:

```ts
// deno-lint-ignore-file no-explicit-any
import moduleLoader, {doTransfer, getContext, sync} from "../dist/uniform.js";
//import moduleLoader, {doTransfer, getContext, sync} from "../dist-wp/main.mjs";

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
let ctx = {}, utils = {};
export const $importContext$ = (U)=>({ctx, utils} = U);

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

## Vite mod for `worker.ts`

### Parts

Main code in transform...

```js
if (compressRE.test(id)) {
    const chunk = await bundleWorkerEntry(config, id)
    const b64c = Buffer.from(
        await new Promise<Uint8Array>((r) =>
            gzip(strToU8(chunk.code), { level: 9 }, (_, d) => r(d)),
        ),
    ).toString('base64')
    return {
        code: `const b64c = "${b64c}"; export default b64c;`,
        // Empty sourcemap to suppress Rollup warning
        map: { mappings: '' },
    }
}
```

Import library `fflate`:

```js
// sometimes needs dedicated library for compress
import { gzip, strToU8 } from 'fflate'
```
