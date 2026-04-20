import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest"
import path from "path"
import fs from "fs-extra"
import { build } from "../../src/commands/build"

describe("SiteMD Build Pipeline", () => {
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const outDir = path.join(fixturePath, "dist")

    beforeAll(async () => {
        vi.spyOn(process, "cwd").mockReturnValue(fixturePath)

        vi.spyOn(process, "exit").mockImplementation(() => undefined as never)

        if (fs.existsSync(outDir)) {
            fs.emptyDirSync(outDir)
        }

        await build()
    })

    afterAll(() => {
        vi.restoreAllMocks()
    })
})