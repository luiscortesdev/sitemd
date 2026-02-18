import { WebSocketServer } from "ws"
import http from "http"

export function attachLiveReload(server: http.Server) {
    const wss = new WebSocketServer({ server })

    function reloadClients() {
        wss.clients.forEach(client => {
            client.send("reload")
        })
    }

    return reloadClients
}