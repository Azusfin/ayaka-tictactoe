"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AyakaClient = void 0;
const framework_1 = require("@sapphire/framework");
const AyakaDatabase_1 = require("./AyakaDatabase");
class AyakaClient extends framework_1.SapphireClient {
    constructor() {
        super({ intents: ["GUILDS"] });
        this.db = new AyakaDatabase_1.AyakaDatabase();
    }
}
exports.AyakaClient = AyakaClient;
