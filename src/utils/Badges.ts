import { Canvas, Image } from "canvas-constructor/cairo"
import { XO_RED, XO_BLUE, XO_GREEN } from "./img/BadgesImg"

export const BADGE_NAMES = [
    "XORed",
    "XOGreen",
    "XOBlue"
] as const

export type Badges = typeof BADGE_NAMES extends readonly (infer E)[] ? E : never

export const BADGES_PRICE = new Map<Badges, number>()

BADGES_PRICE
    .set("XORed", 90)
    .set("XOGreen", 90)
    .set("XOBlue", 90)

export const BADGES_IMG = new Map<Badges, Promise<Image>>()

BADGES_IMG
    .set("XORed", XO_RED)
    .set("XOGreen", XO_GREEN)
    .set("XOBlue", XO_BLUE)

const CANVAS_SIZE = 480
const COORDINATE_START = 20
const BADGE_SIZE = 440
const BADGE_DISTANCE = 40

export async function drawBadges(badges: Badges[]): Promise<Buffer> {
    const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE)

    const dimension = Math.ceil(Math.sqrt(badges.length))
    const ratio = 1 / dimension

    const start = ratio * COORDINATE_START
    const size = ratio * BADGE_SIZE
    const distance = ratio * BADGE_DISTANCE

    let index = 0
    let x = start
    let y = start

    const vertical = Math.ceil(badges.length / dimension)

    for (let i = 0; i < vertical; i++) {
        x = start

        const horizontal = Math.min(dimension, badges.length - 1 - index + 1)

        for (let j = 0; j < horizontal; j++) {
            const img = await BADGES_IMG.get(badges[index++])!

            canvas.printImage(img, x, y, size, size)

            x += size + distance
        }

        y += size + distance
    }

    return canvas.toBufferAsync("image/png", { compressionLevel: 9 })
}
