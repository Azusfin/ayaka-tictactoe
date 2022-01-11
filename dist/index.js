"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@sapphire/plugin-logger/register");
const AyakaClient_1 = require("./structures/AyakaClient");
const config_1 = require("./config");
const client = new AyakaClient_1.AyakaClient();
void client.login(config_1.token);
