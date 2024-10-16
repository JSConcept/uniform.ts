// deno-lint-ignore-file
// !should to be compiled as worker entry!
import exChanger from "../Workers/ExChangerUnit";
import makeModuleLoader from "../Workers/MakeLoader";
export const moduleLoader = makeModuleLoader(exChanger);
export default moduleLoader;
export {exChanger};
