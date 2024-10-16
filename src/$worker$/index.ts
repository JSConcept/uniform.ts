// deno-lint-ignore-file
// !should to be compiled as worker entry!
import exChanger from "../$core$/Workers/ExChangerUnit";
import makeModuleLoader from "../$core$/Workers/MakeLoader";
export const moduleLoader = makeModuleLoader(exChanger);
export default moduleLoader;
export {exChanger};
