import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve } from "../Instruction/Defer.ts";

//
export const $coders      = new PreCoding();
export const $memoryPool  = $coders.memoryPool;
export const $dataHandler = $coders.handler;

//
export const $handler = (command) => {
    const {cmd: nac, uuid, dir, args: [cmd, target, ...args]} = command;

    //
    let transfer: any[] = [];
    if (cmd == "apply" && args.length >= 3) {
        transfer.push(...args.splice(2));
    }

    // before you needs decode its
    return doOnlyAfterResolve($coders.decode([cmd, target, ...args], transfer), ([cmd, target, ...args])=>{
        const result = $dataHandler?.$getHandler?.("promise")?.$handle?.(cmd, target, ...args);
        const ready  = $coders.encode(result, transfer);
        return [ready, transfer] // also, needs to recode back
    });
}

//
export const $resolver = (command) => {
    const transfer = [];
    const {cmd, uuid, dir, result} = command;
    return $coders.decode(result, transfer); // also, needs to decode
}
