// deno-lint-ignore-file no-explicit-any
import exChanger from "../FLOW/ExChangerUnit.ts";

//
exChanger.register(async (src = ""): Promise<any> =>{
    const module = await import(src)
    exChanger.register(module, "!!exports!!");
    await exChanger.sync;
    return module;
}, "!!import!!");

//
export default exChanger;
