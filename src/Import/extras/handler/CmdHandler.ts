import { callReflectCmd } from "../accessor/AccessModule.ts";

//
export const flowHandler = function([cmd, args]) {
    const result = callReflectCmd(cmd, unpack(args));
    return [[result], []];
}
