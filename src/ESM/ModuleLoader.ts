// deno-lint-ignore-file
import ExChanger from "../FLOW/ExChanger.ts";
import { MakeReference, type IWrap } from "../Instruction/InstructionType.ts";
import ObjectProxy from "../Instruction/ObjectProxy.ts";
import PromiseHandler from "../Handlers/PromiseHandler.ts";

// should be converted to inline code
const $inline$ = new URL("./ModuleWorker.ts", import.meta.url).href;

// @ts-ignore "mixed context"
const isWorker = typeof Worker == "undefined" || typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope;

//
const $moduleLoader = async <T extends unknown>(source: string = ""): Promise<T> => {
    const  uWorker  = !isWorker ? new Worker($inline$, {type: "module"}) : self;
    const exChanger = new ExChanger(uWorker);

    //
    await exChanger.initialize();
    const module = await (await exChanger?.access?.("!!import!!") as any)?.(source);
    return module ?? exChanger;
}

//
export const moduleLoader = async <T extends unknown>(source: string = "")=>{
    return (new Proxy(MakeReference($moduleLoader<T>(source)), new ObjectProxy(new PromiseHandler())) as IWrap<T>);
}

//
export default moduleLoader;
