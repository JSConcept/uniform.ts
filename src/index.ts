export * from "./utils.ts";

//
export * from "./ESM/ModuleLoader.ts";

//
import ModuleLoader from "./ESM/ModuleLoader.ts";

// default export
export default ModuleLoader;

//
export {ModuleLoader as moduleLoader};
