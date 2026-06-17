import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        env: {
            DEBUG: process.env.DEBUG || "false"
        },
        include: ["tests/**/*.test.ts"],
    },
    server: {
        watch: {
            ignored: ['**/tests/fixtures/dev-site/**']
        }
    }
})