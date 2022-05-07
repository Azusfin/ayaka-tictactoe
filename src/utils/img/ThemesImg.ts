import { resolveImage, Image } from "canvas-constructor/cairo"

export const AYAKA_IMG = resolveTheme("Ayaka")
export const CLASSY_IMG = resolveTheme("Classy")
export const KEQING_IMG = resolveTheme("Keqing")

function resolveTheme(name: string, extension = "jpg"): Promise<Image> {
    return resolveImage(`assets/themes/${name}.${extension}`)
}
