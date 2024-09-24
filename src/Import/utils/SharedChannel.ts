/*
 * Note about:
 * 0...3 byte: semaphore value
 * 4...7 byte: data length value
 * 8...N byte: data payload
 */
export default class SharedChannel {
    #sharedBuffer: SharedArrayBuffer | null = null;
    #byteOffset: number = 0;

    //
    constructor(sharedBuffer, byteOffset = 0) {
        this.#sharedBuffer = sharedBuffer;
        this.#byteOffset = byteOffset;
    }

    //
    resolveWith(binaryData: Uint8Array | Uint8ClampedArray | Int8Array) {
        if (this.#sharedBuffer) {
            // grow when is possible...
            if ((this.#sharedBuffer.byteLength-this.#byteOffset) < (binaryData.byteLength+8)) {
                // @ts-ignore
                this.#sharedBuffer?.grow?.(this.#byteOffset + binaryData.byteLength+8);
            }

            //
            new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, binaryData.byteLength).set(binaryData);

            // resolve answer
            const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
            Atomics.store(int32, 1, binaryData.byteLength);

            // notify about results...
            Atomics.store(int32, 0, 1);
            Atomics.notify(int32, 0);
            Atomics.store(int32, 0, 0);
        }
    }

    //
    initials() {
        if (!this.#sharedBuffer) return;
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        Atomics.store(int32, 1, 0);
        Atomics.store(int32, 0, 1);
    }

    //
    promised(timeout = 1000) {
        if (!this.#sharedBuffer) return; //
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        const promise = Atomics.waitAsync(int32, 0, 1, timeout)?.value;

        // @ts-ignore
        if (promise.async) {
            // @ts-ignore
            return promise?.then?.(()=>{
                if (this.#sharedBuffer) {
                    return new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, int32[1]);
                }
                return null;
            });
        }
        return new Promise((_, rj)=>rj(promise));
    }

    //
    waitSync(timeout = 1000) {
        if (!this.#sharedBuffer) return; //
        const int32 = new Int32Array(this.#sharedBuffer, this.#byteOffset, 2);
        const result = Atomics.wait(int32, 0, 1, timeout);
        if (result == "ok") {
            return new Uint8Array(this.#sharedBuffer, this.#byteOffset + 8, int32[1]);
        }
        return null;
    }
}
