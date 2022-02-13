import { Canvas, Image } from "canvas-constructor/cairo"
import { XORed, XOGreen, XOBlue } from "./img/BadgesImg"

export const BadgeNames = [
    "XORed",
    "XOGreen",
    "XOBlue"
] as const

export type Badges = typeof BadgeNames extends readonly (infer E)[] ? E : never

export const BadgesPrice = new Map<Badges, number>()

BadgesPrice
    .set("XORed", 90)
    .set("XOGreen", 90)
    .set("XOBlue", 90)

export const BadgesImg = new Map<Badges, Promise<Image>>()

BadgesImg
    .set("XORed", XORed)
    .set("XOGreen", XOGreen)
    .set("XOBlue", XOBlue)

const CanvasSize = 480
const CoordinateStart = 20
const BadgeSize = 440
const BadgeDistance = 40

export async function drawBadges(badges: Badges[]): Promise<Buffer> {
    const canvas = new Canvas(CanvasSize, CanvasSize)

    const dimension = Math.ceil(Math.sqrt(badges.length))
    const ratio = 1 / dimension

    const start = ratio * CoordinateStart
    const size = ratio * BadgeSize
    const distance = ratio * BadgeDistance

    let index = 0
    let x = start
    let y = start

    const vertical = Math.ceil(badges.length / dimension)

    for (let i = 0; i < vertical; i++) {
        x = start

        const horizontal = Math.min(dimension, badges.length - 1 - index + 1)

        for (let j = 0; j < horizontal; j++) {
            const img = await BadgesImg.get(badges[index++])!

            canvas.printImage(img, x, y, size, size)

            x += size + distance
        }

        y += size + distance
    }

    return canvas.toBufferAsync("image/png", { compressionLevel: 9 })
}
