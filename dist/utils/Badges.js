"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBadges = exports.BadgesImg = exports.BadgesPrice = exports.BadgeNames = void 0;
const cairo_1 = require("canvas-constructor/cairo");
const BadgesImg_1 = require("./img/BadgesImg");
exports.BadgeNames = [
    "XORed",
    "XOGreen",
    "XOBlue"
];
exports.BadgesPrice = new Map();
exports.BadgesPrice
    .set("XORed", 90)
    .set("XOGreen", 90)
    .set("XOBlue", 90);
exports.BadgesImg = new Map();
exports.BadgesImg
    .set("XORed", BadgesImg_1.XORed)
    .set("XOGreen", BadgesImg_1.XOGreen)
    .set("XOBlue", BadgesImg_1.XOBlue);
const CanvasSize = 480;
const CoordinateStart = 20;
const BadgeSize = 440;
const BadgeDistance = 40;
async function drawBadges(badges) {
    const canvas = new cairo_1.Canvas(CanvasSize, CanvasSize);
    const dimension = Math.ceil(Math.sqrt(badges.length));
    const ratio = 1 / dimension;
    const start = ratio * CoordinateStart;
    const size = ratio * BadgeSize;
    const distance = ratio * BadgeDistance;
    let index = 0;
    let x = start;
    let y = start;
    const vertical = Math.ceil(badges.length / dimension);
    for (let i = 0; i < vertical; i++) {
        x = start;
        const horizontal = Math.min(dimension, badges.length - 1 - index + 1);
        for (let j = 0; j < horizontal; j++) {
            const img = await exports.BadgesImg.get(badges[index++]);
            canvas.printImage(img, x, y, size, size);
            x += size + distance;
        }
        y += size + distance;
    }
    return canvas.toBufferAsync("image/png", { compressionLevel: 9 });
}
exports.drawBadges = drawBadges;
