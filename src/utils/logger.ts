import chalk from "chalk"

let isDebugMode: boolean = false

export function setDebugMode(state: boolean) {
    console.log("SET DEBUG MODE TO ", state)

    isDebugMode = state
}

export const logger = {
    info(...args: any[]) {
        console.log(chalk.cyanBright(...args))
    },
    
    notice(...args: any[]) {
        console.log(chalk.magentaBright.bold("❗ ", ...args))
    },

    success(...args: any[]) {
        console.log(chalk.greenBright.bold("✅ ", ...args))
    },

    warning(...args: any[]) {
        console.log(chalk.yellowBright.bold("⚠️ ", ...args))
    },

    error(...args: any[]) {
        console.log(chalk.redBright.bold("🚨 ", ...args))
    },

    process(...args: any[]) {
        console.log(chalk.cyanBright.bold("🛠️ ", ...args))
    },

    debug(...args: any[]) {
        if (isDebugMode) {
            console.log("[DEBUG] ", ...args)
        }
    },
}