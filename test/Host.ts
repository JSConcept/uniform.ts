import ExChanger from "../src/FLOW/ExChanger";

//
export const Host = new ExChanger(new Worker(new URL("./Worker.ts", import.meta.url).href, {type: "module"}))
await Host.initialize();

//
const Tungst = Host.access("Tungst");
console.log(Tungst);

console.log(await Tungst.lab);

console.log(await new Tungst());
