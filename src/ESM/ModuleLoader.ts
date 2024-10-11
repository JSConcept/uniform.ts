// deno-lint-ignore-file
import ExChanger from "../FLOW/ExChanger.ts";
import { MakeReference, type IWrap } from "../Instruction/InstructionType.ts";
import ObjectProxy from "../Instruction/ObjectProxy.ts";
import PromiseHandler from "../Handlers/PromiseHandler.ts";

// should be converted to inline code, and compiled from TS
//const $inline$ = new URL("./ModuleWorker.ts", import.meta.url).href;
import $inline$ from "./ModuleWorker.ts?worker&inline";
import loadWorker from "../FLOW/WorkerLib.ts";

//
const $moduleLoader = async <T extends unknown>(source: string = ""): Promise<T> => {
    const  uWorker  = loadWorker($inline$);
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
