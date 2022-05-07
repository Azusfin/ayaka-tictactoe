"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XO_BLUE = exports.XO_GREEN = exports.XO_RED = void 0;
const cairo_1 = require("canvas-constructor/cairo");
exports.XO_RED = resolveBadge("XORed");
exports.XO_GREEN = resolveBadge("XOGreen");
exports.XO_BLUE = resolveBadge("XOBlue");
function resolveBadge(name) {
    return (0, cairo_1.resolveImage)(`assets/badges/${name}.png`);
}
