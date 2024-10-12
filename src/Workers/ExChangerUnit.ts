import { ORG, ExChanger } from "../Library/Shared.ts";

// Web Worker Unit...
const exChanger = await (new ExChanger(self)).initialize();

//
if (typeof self != "undefined") {
    // @ts-ignore ""
    self[ORG.exchanger] = exChanger;
}

//
export default exChanger;
