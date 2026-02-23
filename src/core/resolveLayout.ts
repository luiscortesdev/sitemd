import { access } from "fs/promises";
import path from "path"

// Check if a layout exists at the given path
async function exists(path: string): Promise<boolean> {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

// Return the path to the theme layout with the given name if there does not exist a user layout with the same name.
export async function resolveLayout(projectRoot: string, layoutName: string): Promise<string> {
    const userLayout = path.join(projectRoot, "layouts", layoutName)
    const themeLayout = path.join(projectRoot, "theme", "layouts", layoutName)

    // If the user has a layout called layoutName, we return that
    if (await exists(userLayout)) {
        return userLayout
    }

    // Else if the theme has a layout called layoutName, we return that
    if (await exists(themeLayout)) {
        return themeLayout
    }

    // If neither exists we throw an error
    throw new Error(`${layoutName} NOT FOUND IN layouts/ OR theme/layouts/`)
}