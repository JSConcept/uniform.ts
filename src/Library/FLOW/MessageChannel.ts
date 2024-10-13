// deno-lint-ignore-file no-explicit-any
import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve } from "../Utils/Useful.ts";

//
/*@__MANGLE_PROP__*/ export const $cd = new PreCoding();
/*@__MANGLE_PROP__*/ export const $mp = $cd.$mp;
/*@__MANGLE_PROP__*/ export const $dh = $cd.$hndr;

//
export const $handler = (command: any) => {
    const {args: [cmd, target, ...args]} = command;

    //
    const transfer: unknown[] = [];
    if (cmd == "apply" && args.length >= 3) { transfer.push(...args.splice(2)); }

    // before you needs decode its
    return doOnlyAfterResolve($cd.decode([cmd, target, ...args], transfer), ([cmd, target, ...args])=>{
        const result = $dh?.$getHandler?.("pms")?.$hnd?.(cmd, target, ...args);
        const ready  = $cd.encode(result, transfer);
        return [ready, transfer] // also, needs to recode back
    });
}
export const $resolver = (command: any) => (command.result);
