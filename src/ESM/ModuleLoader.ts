// deno-lint-ignore-file
import ExChanger from "../Library/FLOW/ExChanger.ts";
import { MakeReference, type IWrap } from "../Library/Instruction/InstructionType.ts";
import ObjectProxy from "../Library/Instruction/ObjectProxy.ts";
import PromiseHandler from "../Library/Handlers/PromiseHandler.ts";

// should be converted to inline code, and compiled from TS
import {$default$} from "../Workers/InlineWorkers.ts";
import loadWorker from "../Library/FLOW/WorkerLib.ts";

//
const $moduleLoader = async <T extends unknown>(source: string = ""): Promise<T> => {
    const  uWorker  = loadWorker($default$);
    const exChanger = await (new ExChanger(uWorker)).initialize();
    const module    = await (await exChanger?.access?.("!!import!!") as any)?.(source);
    return module ?? exChanger;
}

//
export const moduleLoader = async <T extends unknown>(source: string = "")=>{
    return (new Proxy(MakeReference($moduleLoader<T>(source)), new ObjectProxy(new PromiseHandler())) as IWrap<T>);
}

//
export default moduleLoader;
