// Web Worker Unit...
import ExChanger from "../Library/FLOW/ExChanger.ts";
import ORG from "../Library/Instruction/InstructionType.ts";

//
const exChanger = await (new ExChanger(self)).initialize();

//
if (typeof self != "undefined") {
    // @ts-ignore ""
    self[ORG.exchanger] = exChanger;
}

//
export default exChanger;
