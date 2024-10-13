// deno-lint-ignore-file ban-ts-comment no-explicit-any
/*@__PURE__*/ import { type MPromise, isPromise } from "./Useful.ts";

// @ts-ignore "extra `KB` for library..."
/*@__PURE__*/
//import * as cbor from "cbor-x";

/*
 * Note about:
 * 0...3 byte: semaphore value
 * 4...7 byte: data length value
 * 8...N byte: data payload
 */

/*@__PURE__*/
export default class SharedChannel<T extends unknown> {
    //[x: string]: (timeout?: number) => unknown; // @ts-ignore
    /*@__PURE__*/ #sharedBuffer: SharedArrayBuffer | null = null;
    #byteOffset: number = 0;
    $binCoder: any = null;

    /*@__PURE__*/ 
    constructor(sharedBuffer: SharedArrayBuffer | null, byteOffset = 0, binCoder: any = null) {
        this.#sharedBuffer = sharedBuffer;
        this.#byteOffset = byteOffset;
        this.$binCoder = binCoder;
    }

    //
    /*@__PURE__*/
    /*@__PURE__*/ resolve(object: T|Uint8Array|unknown = {}) {
        // @ts-ignore "no valid type"
        /*@__PURE__*/
        return this.$resolveWith(this.$binCoder?.encode?.(object ?? {}) ?? new Uint8Array([]));
    }

    //
    /*@__PURE__*/
    /*@__PURE__*/ reject(e: Error | unknown): unknown { throw e; }

    // @ts-ignore "DOM isn't recognized"
    /*@__PURE__*/ waitAuto(timeout = 1000): unknown { return /*@__PURE__*/ (self?.document ? /*@__PURE__*/ this.waitAsync(timeout) : /*@__PURE__*/ this.waitSync(timeout)); }
    /*@__PURE__*/ waitSync(timeout = 1000): unknown { const result = /*@__PURE__*/ this.$waitSync(timeout); return result ? this.$binCoder.decode(result ?? new Uint8Array([])) : null; }

    // not implemented directly
    /*@__PURE__*/ waitAsync(_timeout = 1000): unknown { return null; };
    /*@__PURE__*/ $resolveWith(binaryData: Uint8Array | Uint8ClampedArray | Int8Array): any {
        if (this.#sharedBuffer) {
            // grow when is possible...
            if ((this.#sharedBuffer.byteLength-this.#byteOffset) < (binaryData.byteLength+8)) {
                // @ts-ignore
                this.#sharedBuffer?.grow?.(this.#byteOffset + binaryData.byteLength+8);
            }

            //
            const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
            if (Atomics.load(int32, 0) != 0) {
                new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, binaryData.byteLength).set(binaryData);

                // resolve answer
                Atomics.store(int32, 1, binaryData.byteLength);

                // notify about results...
                Atomics.store(int32, 0, 1);
                Atomics.notify(int32, 0);
                Atomics.store(int32, 0, 0);
            }
        }
    }

    /*@__PURE__*/ $initials() {
        if (!this.#sharedBuffer) return;
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        Atomics.store(int32, 1, 0);
        Atomics.store(int32, 0, 1);
    }

    /*@__PURE__*/ $promised(timeout = 1000) {
        if (!this.#sharedBuffer) return; //
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        const promise = /*@__PURE__*/ Atomics.waitAsync(int32, 0, 1, timeout)?.value;

        // @ts-ignore
        if (promise.async) {
            // @ts-ignore
            return promise?.then?.(()=>{
                if (this.#sharedBuffer) {
                    return new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, int32[1]);
                }
                return null;
            })?.catch?.(console.trace.bind(console));
        }

        //
        return new Promise((_, rj)=>rj(promise));
    }

    /*@__PURE__*/ $waitSync(timeout = 1000) {
        if (!this.#sharedBuffer) return; //
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        const result = /*@__PURE__*/ Atomics.wait(int32, 0, 1, timeout);
        if (result == "ok") {
            return new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, int32[1]);
        }
        return null;
    }
}

/*@__PURE__*/
export const doOnlyAfterResolve = <T extends unknown|any>(meta: MPromise<T>, cb: (u: T)=>MPromise<T>|null|void): MPromise<any>|null|void => {
    if (/*@__PURE__*/ isPromise(meta)) {
        const chain = (meta as any)?.then?.(cb)?.catch?.(console.trace.bind(console)) ?? cb(meta as T);
        //console.trace(chain);
        return chain;
    }
    /*@__PURE__*/ 
    if (typeof SharedChannel != "undefined" && meta instanceof SharedChannel) {
        /*@__PURE__*/ 
        return /*@__PURE__*/ doOnlyAfterResolve((meta as SharedChannel<T>)?.waitAuto?.() as T, cb);
    }
    return cb(meta as T);
}

/*@__PURE__*/
SharedChannel.prototype.waitAsync = function (timeout = 1000): unknown {
    /*@__PURE__*/ const result = /*@__PURE__*/ this.$promised(timeout);
    /*@__PURE__*/ 
    return /*@__PURE__*/ doOnlyAfterResolve(result, (bin: unknown|Uint8Array)=>{
        return bin ? this.$binCoder?.decode?.(bin as Uint8Array) : null;
    });
}
