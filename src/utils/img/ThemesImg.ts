import { resolveImage, Image } from "canvas-constructor/cairo"

export const AyakaImg = resolveTheme("Ayaka")
export const ClassyImg = resolveTheme("Classy")
export const KeqingImg = resolveTheme("Keqing")

function resolveTheme(name: string, extension = "jpg"): Promise<Image> {
    return resolveImage(`assets/themes/${name}.${extension}`)
}
