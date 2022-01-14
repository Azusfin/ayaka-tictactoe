"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AyakaClient = void 0;
const framework_1 = require("@sapphire/framework");
class AyakaClient extends framework_1.SapphireClient {
    constructor() {
        super({ intents: ["GUILDS"] });
    }
}
exports.AyakaClient = AyakaClient;
