// deno-lint-ignore-file
import exChanger from "./ExChangerUnit.ts";
import makeModuleLoader from "../Atomic/MakeLoader.ts";
export const moduleLoader = makeModuleLoader(exChanger);
export default moduleLoader;
export {exChanger};
