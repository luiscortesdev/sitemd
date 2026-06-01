import chalk from "chalk"

let isDebugMode: boolean = false

export function setDebugMode(state: boolean) {
    if (state === true)
        console.log(chalk.green("SET DEBUG MODE TO ", state))
    
    isDebugMode = state
}

export const logger = {
    info(...args: any[]) {
        console.log(chalk.cyanBright(...args))
    },
    
    notice(...args: any[]) {
        console.log(chalk.whiteBright.bold("\n", "🚨 ", ...args, "\n"))
    },

    success(...args: any[]) {
        console.log(chalk.greenBright.bold("✅ ", ...args, "\n"))
    },

    warning(...args: any[]) {
        console.log(chalk.yellowBright.bold("\n", "⚠️ ", ...args, "\n"))
    },

    error(...args: any[]) {
        console.log(chalk.redBright.bold("\n", "❌ ", ...args, "\n"))
    },

    process(...args: any[]) {
        console.log(chalk.blueBright.bold("🛠️ ", ...args))
    },

    debug(...args: any[]) {
        if (isDebugMode) {
            console.log("[DEBUG] ", ...args, "\n")
        }
    },
}