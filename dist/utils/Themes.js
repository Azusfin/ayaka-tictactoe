"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeOf = exports.THEMES_INFO = exports.KEQING = exports.CLASSY = exports.AYAKA = exports.THEMES_PRICE = exports.THEME_NAMES = void 0;
const ThemesImg_1 = require("./img/ThemesImg");
exports.THEME_NAMES = [
    "Ayaka",
    "Classy",
    "Keqing"
];
exports.THEMES_PRICE = new Map();
exports.THEMES_PRICE
    .set("Ayaka", 0)
    .set("Classy", 150)
    .set("Keqing", 350);
exports.AYAKA = {
    img: ThemesImg_1.AYAKA_IMG,
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
};
exports.CLASSY = {
    img: ThemesImg_1.CLASSY_IMG,
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
};
exports.KEQING = {
    img: ThemesImg_1.KEQING_IMG,
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
};
exports.THEMES_INFO = new Map();
exports.THEMES_INFO
    .set("Ayaka", exports.AYAKA)
    .set("Classy", exports.CLASSY)
    .set("Keqing", exports.KEQING);
function themeOf(name) {
    return exports.THEMES_INFO.get(name);
}
exports.themeOf = themeOf;
