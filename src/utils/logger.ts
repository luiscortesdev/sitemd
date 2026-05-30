let isDebugMode: boolean = false

export function setDebugMode(state: boolean) {
    console.log("SET DEBUG MODE TO ", state)

    isDebugMode = state
}

export const logger = {
    info(args: any[]) {
        console.log(...args)
    },
    
    notice(args: any[]) {
        console.log("❗ ", ...args)
    },

    success(args: any[]) {
        console.log("✅ ", ...args)
    },

    warning(args: any[]) {
        console.log("⚠️ ", ...args)
    },

    error(args: any[]) {
        console.log("🚨 ", ...args)
    },

    process(args: any[]) {
        console.log("🛠️ ", ...args)
    },

    debug(args: any[]) {
        if (isDebugMode) {
            console.log("[DEBUG] ", ...args)
        }
    },
}