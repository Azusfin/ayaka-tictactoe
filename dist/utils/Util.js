"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numEmojis = exports.register = void 0;
const config_1 = require("../config");
function register(registry, builder) {
    registry.registerChatInputCommand(builder, {
        guildIds: undefined,
        behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */
    });
    if (config_1.servers.length) {
        registry.registerChatInputCommand(builder, {
            guildIds: config_1.servers,
            behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */
        });
    }
}
exports.register = register;
exports.numEmojis = [
    "1️⃣", "2️⃣", "3️⃣",
    "4️⃣", "5️⃣", "6️⃣",
    "7️⃣", "8️⃣", "9️⃣"
];
