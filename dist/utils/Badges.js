"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBadges = exports.BADGES_IMG = exports.BADGES_PRICE = exports.BADGE_NAMES = void 0;
const cairo_1 = require("canvas-constructor/cairo");
const BadgesImg_1 = require("./img/BadgesImg");
exports.BADGE_NAMES = [
    "XORed",
    "XOGreen",
    "XOBlue"
];
exports.BADGES_PRICE = new Map();
exports.BADGES_PRICE
    .set("XORed", 90)
    .set("XOGreen", 90)
    .set("XOBlue", 90);
exports.BADGES_IMG = new Map();
exports.BADGES_IMG
    .set("XORed", BadgesImg_1.XO_RED)
    .set("XOGreen", BadgesImg_1.XO_GREEN)
    .set("XOBlue", BadgesImg_1.XO_BLUE);
const CANVAS_SIZE = 480;
const COORDINATE_START = 20;
const BADGE_SIZE = 440;
const BADGE_DISTANCE = 40;
async function drawBadges(badges) {
    const canvas = new cairo_1.Canvas(CANVAS_SIZE, CANVAS_SIZE);
    const dimension = Math.ceil(Math.sqrt(badges.length));
    const ratio = 1 / dimension;
    const start = ratio * COORDINATE_START;
    const size = ratio * BADGE_SIZE;
    const distance = ratio * BADGE_DISTANCE;
    let index = 0;
    let x = start;
    let y = start;
    const vertical = Math.ceil(badges.length / dimension);
    for (let i = 0; i < vertical; i++) {
        x = start;
        const horizontal = Math.min(dimension, badges.length - 1 - index + 1);
        for (let j = 0; j < horizontal; j++) {
            const img = await exports.BADGES_IMG.get(badges[index++]);
            canvas.printImage(img, x, y, size, size);
            x += size + distance;
        }
        y += size + distance;
    }
    return canvas.toBufferAsync("image/png", { compressionLevel: 9 });
}
exports.drawBadges = drawBadges;
