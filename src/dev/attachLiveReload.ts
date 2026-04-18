import http from "http"
import { WebSocketServer } from "ws"

export function attachLiveReload(server: http.Server) {
    const wss = new WebSocketServer({ server })

    function reloadClients() {
        wss.clients.forEach(client => {
            client.send("reload")
        })
    }

    return reloadClients
}