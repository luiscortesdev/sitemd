import cypto from "crypto"

export function hashContent(input: string) {
    return cypto.createHash("sha256").update(input).digest("hex")
}