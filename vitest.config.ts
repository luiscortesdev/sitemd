import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        env: {
            DEBUG: process.env.DEBUG || "false"
        },
        retry: process.env.CI ? 2 : 0,
        include: ["tests/**/*.test.ts"],
    },
    server: {
        watch: {
            ignored: ["**/tests/fixtures/dev-site/**", "**/tests/fixtures/cmd-site/**"]
        }
    }
})