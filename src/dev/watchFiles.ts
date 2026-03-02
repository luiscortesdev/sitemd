import chokidar from "chokidar"

export function watchFiles(onChange: () => Promise<void>) {
    const watcher = chokidar.watch(
        ["content", "layouts", "public", "theme"],
        { ignoreInitial: true }
    )

    watcher.on("all", async () => {
        console.log("FILE CHANGE DETECTED. REBUILDING...")
        await onChange()
    })
}