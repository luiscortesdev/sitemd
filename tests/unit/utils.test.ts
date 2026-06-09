import { describe, it, expect } from "vitest";

import { areStringArraysEqual } from "../../src/utils/index"
import { normalizePath } from "../../src/utils/index";

describe("Utility Functions", () => {
    it("Should correctly compare two identical arrays", () => {
        const arr1 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\posts\\index.md"]
        const arr2 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\posts\\index.md"]

        expect(areStringArraysEqual(arr1, arr2)).toBe(true)
    })

    it("Should correctly detect when the arrays are different, but have the same length", () => {
        const arr1 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\post\\index.md"]
        const arr2 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\posts\\index.md"]

        expect(areStringArraysEqual(arr1, arr2)).toBe(false)
    })
    
    it("Should correctly detect when the arrays are different and have different lengths", () => {
        const arr1 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\posts\\index.md"]
        const arr2 = ["content\\blog\\index.md", "content\\index.md", "content\\blog\\posts\\index.md", "content\\about\\index.md", "content\\blog\\posts\\1\\index.md"]

        expect(areStringArraysEqual(arr1, arr2)).toBe(false)
    })

    it("Should properly normalize windows os paths with forward slashes", () => {
        const windowsPath = "C:\\Users\\Username\\Documents\\SiteMDProject\\layouts\\default.njk"
        const expectedPath = "C:/Users/Username/Documents/SiteMDProject/layouts/default.njk"

        expect(normalizePath(windowsPath, "\\")).toBe(expectedPath)
    })

    it("Should properly normalize linux/mac os paths", () => {
        const linuxPath = "/Users/Username/Documents/SiteMDProject/layouts/default.njk"
        const expectedPath = "/Users/Username/Documents/SiteMDProject/layouts/default.njk"

        expect(normalizePath(linuxPath, "/")).toBe(expectedPath)
    })
})