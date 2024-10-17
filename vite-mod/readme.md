# Vite mod for `worker.ts`

## Parts

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

Reg-ex and other variables:

```js
// reg-ex for check query
const compressRE = /[?&]compress\b/
```
