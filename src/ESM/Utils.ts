// deno-lint-ignore-file no-explicit-any
import type ExChanger from "../FLOW/ExChanger.ts";
import ORG, { doOnlyAfterResolve, isSymbol, FORBIDDEN_KEYS, META_KEYS } from "../Instruction/InstructionType.ts";

//
const wrapExChanger = (exChanger: ExChanger|null): any => {
    if (!exChanger) return null;

    //
    return new Proxy(exChanger, {
        get(target: ExChanger, prop: any): any {
            if (prop == ORG.sync) { return target.sync; };
            if (prop == ORG.exchanger) { return target; };
            if ( // forbidden actions
                isSymbol(prop) ||
                FORBIDDEN_KEYS.has(prop as string) || 
                META_KEYS?.has?.(prop as any)
            ) { return null; };
            return target.access(prop);
        },
        set(target: ExChanger, prop: string, value: any): any {
            return target.register(value, prop);
        }
    });
}

//
export const getContext = (wModule: any)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        return wrapExChanger(mx?.[ORG.exchanger] ?? mx);
    });
}

//
export const doTransfer = (wModule: any, name: any, node: any|null = null)=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exchanger] ?? mx;
        return exChanger?.doTransfer(name, node);
    });
}

//
export const transfer = (wModule: any, node: any|null = null, name: any = "")=>{
    return doOnlyAfterResolve(wModule, (mx)=>{
        const exChanger = mx?.[ORG.exchanger] ?? mx;
        return exChanger?.transfer(node, name);
    });
}
