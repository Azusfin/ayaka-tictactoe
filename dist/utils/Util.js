"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
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
