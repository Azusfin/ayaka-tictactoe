"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeOf = exports.ThemesInfo = exports.Keqing = exports.Classy = exports.Ayaka = exports.ThemesPrice = exports.ThemeNames = void 0;
const ThemesImg_1 = require("./img/ThemesImg");
exports.ThemeNames = [
    "Ayaka",
    "Classy",
    "Keqing"
];
exports.ThemesPrice = new Map();
exports.ThemesPrice
    .set("Ayaka", 0)
    .set("Classy", 150)
    .set("Keqing", 350);
exports.Ayaka = {
    img: ThemesImg_1.AyakaImg,
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
exports.Classy = {
    img: ThemesImg_1.ClassyImg,
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
exports.Keqing = {
    img: ThemesImg_1.KeqingImg,
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
exports.ThemesInfo = new Map();
exports.ThemesInfo
    .set("Ayaka", exports.Ayaka)
    .set("Classy", exports.Classy)
    .set("Keqing", exports.Keqing);
function themeOf(name) {
    return exports.ThemesInfo.get(name);
}
exports.themeOf = themeOf;
