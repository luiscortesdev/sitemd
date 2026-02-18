import chokidar from "chokidar"

export function watchFiles(onChange: () => Promise<void>) {
    const watcher = chokidar.watch(
        ["content", "layouts", "public"],
        { ignoreInitial: true }
    )

    watcher.on("all", async () => {
        console.log("FILE CHANGE DETECTED. REBUILDING...")
        await onChange()
    })
}