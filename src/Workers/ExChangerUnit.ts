// Web Worker Unit...
import ExChanger from "../FLOW/ExChanger.ts";
import ORG from "../Instruction/InstructionType.ts";

//
const exChanger = await (new ExChanger(self)).initialize();

//
if (typeof self != "undefined") {
    // @ts-ignore ""
    self[ORG.exchanger] = exChanger;
}

//
export default exChanger;
