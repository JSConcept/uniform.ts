import ExChanger from "../src/FLOW/ExChanger";

//
export const Host = new ExChanger(new Worker(new URL("./Worker.ts", import.meta.url).href, {type: "module"}))
await Host.initialize();

//
const Tungst = await Host.access("Tungst");
console.log(Tungst);

console.log(await Tungst.lab);

const tgn = (new Tungst());
console.log(tgn);


console.log( tgn.callback(6));
