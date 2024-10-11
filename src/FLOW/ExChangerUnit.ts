// Web Worker Unit...
import ExChanger from "./ExChanger.ts";
import ORG from "../Instruction/InstructionType.ts";

//
const exChanger = new ExChanger(self);
await exChanger.initialize();

//
if (typeof self != "undefined") {
    // @ts-ignore ""
    self[ORG.exchanger] = exChanger;
}

//
export default exChanger;
