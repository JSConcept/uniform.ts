// deno-lint-ignore-file no-explicit-any
/*@__PURE__*/ import PreCoding from "../PreCoding/PreCoding.ts";
/*@__PURE__*/ import { doOnlyAfterResolve } from "../Utils/Useful.ts";

//
/*@__PURE__*/ export const $coders      = new PreCoding();
/*@__PURE__*/ export const $memoryPool  = $coders.$memoryPool;
/*@__PURE__*/ export const $dataHandler = $coders.$handler;

/*@__PURE__*/ 
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

/*@__PURE__*/ 
export const $resolver = (command: any) => (command.result);
