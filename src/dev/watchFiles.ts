import chokidar from "chokidar"

export function watchFiles(onChange: () => Promise<void>, onDeletion: (path: string) => Promise<void>) {
    const watcher = chokidar.watch(
        ["content", "layouts", "public", "theme"],
        { ignoreInitial: true }
    )

    watcher.on("unlink", async (path) => {
        console.log("A FILE HAS BEEN DELETED!")
        await onDeletion(path)
    })

    watcher.on("all", async () => {
        console.log("FILE CHANGE DETECTED. REBUILDING...")
        await onChange()
    })
}