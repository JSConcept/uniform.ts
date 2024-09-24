import UUIDMap from "@ux-ts/uniform/utils/UUIDMap.ts";

//
export class AM {
    static objectMap = new UUIDMap();

    //
    static get(uuid: string, name: string, ctx: any) {
        return Reflect.get(AM.objectMap.get(uuid), name, ctx)
    }

    //
    static has(uuid: string, name: string) {
        return Reflect.has(AM.objectMap.get(uuid), name)
    }

    //
    static access(uuid: string) {
        return AM.objectMap.get(uuid);
    }

    //
    static set(uuid: string, name: string, value: any) {
        return Reflect.set(AM.objectMap.get(uuid), name, value);
    }

    //
    static apply(uuid: string, thisArg: any, args: any[]) {
        return Reflect.apply(AM.objectMap.get(uuid) as Function, thisArg, args);
    }

    //
    static construct(uuid: string, args: any[], newT: any) {
        return Reflect.apply(AM.objectMap.get(uuid) as Function, args, newT);
    }

    //
    static deleteProperty(uuid: string, name: string) {
        return Reflect.deleteProperty(AM.objectMap.get(uuid), name)
    }
}

//
export const callReflectCmd = (cmd, ...args)=>{
    return AM[cmd]?.(...args);
}
