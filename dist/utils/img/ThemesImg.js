"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEQING_IMG = exports.CLASSY_IMG = exports.AYAKA_IMG = void 0;
const cairo_1 = require("canvas-constructor/cairo");
exports.AYAKA_IMG = resolveTheme("Ayaka");
exports.CLASSY_IMG = resolveTheme("Classy");
exports.KEQING_IMG = resolveTheme("Keqing");
function resolveTheme(name, extension = "jpg") {
    return (0, cairo_1.resolveImage)(`assets/themes/${name}.${extension}`);
}
