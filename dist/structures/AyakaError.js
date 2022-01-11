"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AyakaError = void 0;
class AyakaError extends Error {
    constructor(name, message) {
        super(message);
        this.name = `AyakaError [${name}]`;
    }
}
exports.AyakaError = AyakaError;
