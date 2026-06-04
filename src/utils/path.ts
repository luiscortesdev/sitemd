export function normalizePath(path: string, separator: string) {
    return path.split(separator).join("/")
}