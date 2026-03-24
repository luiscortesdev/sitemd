import chokidar from "chokidar"

export function watchFiles(onChange: () => Promise<void>, onDeletion: () => Promise<void>) {
    const watcher = chokidar.watch(
        ["content", "layouts", "public", "theme"],
        { ignoreInitial: true }
    )

    watcher.on("unlink", async () => {
        console.log("A FILE HAS BEEN DELETED!")
        await onDeletion()
    })

    watcher.on("all", async () => {
        console.log("FILE CHANGE DETECTED. REBUILDING...")
        await onChange()
    })
}