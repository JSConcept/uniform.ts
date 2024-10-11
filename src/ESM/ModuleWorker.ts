// deno-lint-ignore-file no-explicit-any
import exChanger from "../FLOW/ExChangerUnit.ts";

// make import loader support
exChanger.register((src: string = ""): Promise<any> => import(/* @vite-ignore */ src), "!!import!!");

//
export default exChanger;
