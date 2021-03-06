import { Image } from "canvas-constructor/cairo"
import { AYAKA_IMG, CLASSY_IMG, KEQING_IMG } from "./img/ThemesImg"

export interface Theme {
    img: Promise<Image>
    quality: number
    lineOffset: number
    size: {
        width: number
        height: number
        xo: number
    }
    position: {
        horizontal: {
            first: number
            second: number
            third: number
        }
        vertical: {
            first: number
            second: number
            third: number
        }
    }
}

export const THEME_NAMES = [
    "Ayaka",
    "Classy",
    "Keqing"
] as const

export type Themes = typeof THEME_NAMES extends readonly (infer E)[] ? E : never

export const THEMES_PRICE = new Map<Themes, number>()

THEMES_PRICE
    .set("Ayaka", 0)
    .set("Classy", 150)
    .set("Keqing", 350)

export const AYAKA: Theme = {
    img: AYAKA_IMG,
    quality: 0.5,
    lineOffset: 134,
    size: {
        width: 1128,
        height: 1469,
        xo: 122
    },
    position: {
        horizontal: {
            first: 309,
            second: 451,
            third: 602
        },
        vertical: {
            first: 162,
            second: 314,
            third: 466
        }
    }
}

export const CLASSY: Theme = {
    img: CLASSY_IMG,
    quality: 0.6,
    lineOffset: 175,
    size: {
        width: 1469,
        height: 1103,
        xo: 163
    },
    position: {
        horizontal: {
            first: 221,
            second: 422,
            third: 618
        },
        vertical: {
            first: 254,
            second: 472,
            third: 671
        }
    }
}

export const KEQING: Theme = {
    img: KEQING_IMG,
    quality: 0.35,
    lineOffset: 182,
    size: {
        width: 1469,
        height: 1102,
        xo: 170
    },
    position: {
        horizontal: {
            first: 174,
            second: 442,
            third: 662
        },
        vertical: {
            first: 194,
            second: 434,
            third: 660
        }
    }
}

export const THEMES_INFO = new Map<Themes, Theme>()

THEMES_INFO
    .set("Ayaka", AYAKA)
    .set("Classy", CLASSY)
    .set("Keqing", KEQING)

export function themeOf(name: Themes): Theme {
    return THEMES_INFO.get(name)!
}
