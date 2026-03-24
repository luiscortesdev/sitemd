import PATH from "path"

export async function handleCleanup(path: string) {
    const root = process.cwd()

    const topLevelDir = path.split(PATH.sep)[0]
    const secondLevelDir = path.split(PATH.sep)[1]
    const fullPath = PATH.join(root, path)

}