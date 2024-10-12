import ExChanger from "../Library/FLOW/ExChanger.ts";
import { ORG } from "../Library/Utils/Useful.ts";

// Web Worker Unit...
const exChanger = await (new ExChanger(self)).initialize();

//
if (typeof self != "undefined") {
    // @ts-ignore ""
    self[ORG.exchanger] = exChanger;
}

//
export default exChanger;
