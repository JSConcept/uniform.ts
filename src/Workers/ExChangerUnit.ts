import ExChanger from "../Library/FLOW/ExChanger.ts";
import { ORG } from "../Library/Utils/Useful.ts";

// Web Worker Unit...
export const exChanger = await (new ExChanger(self)).initialize();

// @ts-ignore ""
if (typeof self != "undefined") { self[ORG.exchanger] = exChanger; }

//
export default exChanger;
