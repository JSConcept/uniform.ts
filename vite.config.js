import { defineConfig, loadEnv } from "vite";

//
export default defineConfig({
    server: {
        port: 5173,
        open: false,
        origin: "http://localhost:5173/",
        
    },
});
