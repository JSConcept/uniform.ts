export * from "./utils.ts";

//
export * from "./src/ESM/ModuleLoader.ts";

//
import ModuleLoader from "./src/ESM/ModuleLoader.ts";

// default export
export default ModuleLoader;

//
export {ModuleLoader as moduleLoader};
