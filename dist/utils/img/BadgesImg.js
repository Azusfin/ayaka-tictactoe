"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XOBlue = exports.XOGreen = exports.XORed = void 0;
const cairo_1 = require("canvas-constructor/cairo");
exports.XORed = resolveBadge("XORed");
exports.XOGreen = resolveBadge("XOGreen");
exports.XOBlue = resolveBadge("XOBlue");
function resolveBadge(name) {
    return (0, cairo_1.resolveImage)(`assets/badges/${name}.png`);
}
