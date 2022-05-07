import { resolveImage, Image } from "canvas-constructor/cairo"

export const XO_RED = resolveBadge("XORed")
export const XO_GREEN = resolveBadge("XOGreen")
export const XO_BLUE = resolveBadge("XOBlue")

function resolveBadge(name: string): Promise<Image> {
    return resolveImage(`assets/badges/${name}.png`)
}
