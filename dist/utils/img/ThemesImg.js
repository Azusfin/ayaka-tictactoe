"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeqingImg = exports.ClassyImg = exports.AyakaImg = void 0;
const cairo_1 = require("canvas-constructor/cairo");
exports.AyakaImg = resolveTheme("Ayaka");
exports.ClassyImg = resolveTheme("Classy");
exports.KeqingImg = resolveTheme("Keqing");
function resolveTheme(name, extension = "jpg") {
    return (0, cairo_1.resolveImage)(`assets/themes/${name}.${extension}`);
}
