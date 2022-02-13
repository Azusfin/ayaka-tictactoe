import { resolveImage, Image } from "canvas-constructor/cairo"

export const XORed = resolveBadge("XORed")
export const XOGreen = resolveBadge("XOGreen")
export const XOBlue = resolveBadge("XOBlue")

function resolveBadge(name: string): Promise<Image> {
    return resolveImage(`assets/badges/${name}.png`)
}
