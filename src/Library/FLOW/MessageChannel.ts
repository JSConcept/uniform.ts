// deno-lint-ignore-file no-explicit-any
import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve } from "../Instruction/InstructionType.ts";

//
export const $coders      = new PreCoding();
export const $memoryPool  = $coders.$memoryPool;
export const $dataHandler = $coders.$handler;

//
export const $handler = (command: any) => {
    const {args: [cmd, target, ...args]} = command;

    //
    const transfer: unknown[] = [];
    if (cmd == "apply" && args.length >= 3) { transfer.push(...args.splice(2)); }

    // before you needs decode its
    return doOnlyAfterResolve($coders.decode([cmd, target, ...args], transfer), ([cmd, target, ...args])=>{
        const result = $dataHandler?.$getHandler?.("promise")?.$handle?.(cmd, target, ...args);
        const ready  = $coders.encode(result, transfer);
        return [ready, transfer] // also, needs to recode back
    });
}

//
export const $resolver = (command: any) => (command.result);
