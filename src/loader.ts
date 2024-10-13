// deno-lint-ignore-file no-explicit-any
const loadWorker = (WX: any): Worker|null =>{
    /*@__PURE__*/ if (WX instanceof Worker) { return WX; } else
    /*@__PURE__*/ if (typeof WX == "function") { return new WX(); } else
    /*@__PURE__*/ if (typeof WX == "string") {
        if (URL.canParse(WX)) { return new Worker(WX, {type: "module"}); };
        return new Worker(URL.createObjectURL(new Blob([WX], {type: "application/javascript"})), {type: "module"});
    } else
    /*@__PURE__*/ if (WX instanceof Blob || WX instanceof File) { return new Worker(URL.createObjectURL(WX), {type: "module"}); }
    /*@__PURE__*/ return (typeof self != "undefined" ? self : null) as unknown as Worker;
}

//
/*@__PURE__*/ export const $moduleLoader = async <T extends unknown>(moduleSource: string, workerCode: string = ""): Promise<T> => {
    if (!moduleSource || typeof moduleSource != "string") throw new Error("Invalid module source");

    // if url too long, un-compress code
    const uWorker   = loadWorker(workerCode);
    const EXChanger = (await import("./Library/FLOW/ExChanger.ts")).default;
    const exChanger = new EXChanger(uWorker)?.initialize?.();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(moduleSource);
    return module;
}
