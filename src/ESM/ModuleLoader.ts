// deno-lint-ignore-file
import ExChanger from "../FLOW/ExChanger.ts";
import { MakeReference, type IWrap } from "../Instruction/InstructionType.ts";
import ObjectProxy from "../Instruction/ObjectProxy.ts";
import PromiseHandler from "../Handlers/PromiseHandler.ts";

// should be converted to inline code, and compiled from TS
import {$default$} from "../Workers/InlineWorkers.ts";
import loadWorker from "../FLOW/WorkerLib.ts";

//
const $moduleLoader = async <T extends unknown>(source: string = ""): Promise<T> => {
    const  uWorker  = loadWorker($default$);
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
