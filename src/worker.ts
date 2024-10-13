// deno-lint-ignore-file
import exChanger from "./Workers/ExChangerUnit.ts";
import makeModuleLoader from "./Workers/MakeLoader.ts";
export const moduleLoader = makeModuleLoader(exChanger);
export default moduleLoader;
export {exChanger};
