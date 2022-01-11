"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDatabase = exports.servers = exports.owners = exports.maintenance = exports.embedColor = exports.mongoURL = exports.token = void 0;
require("dotenv/config");
const AyakaError_1 = require("./structures/AyakaError");
exports.token = process.env["AYAKA_TICTACTOE_TOKEN"];
if (!exports.token)
    throw new AyakaError_1.AyakaError("CONFIG", "AYAKA_TICTACTOE_TOKEN environment variable must exist");
exports.mongoURL = process.env["AYAKA_TICTACTOE_MONGO_URL"];
if (!exports.mongoURL)
    throw new AyakaError_1.AyakaError("CONFIG", "AYAKA_TICTACTOE_MONGO_URL environment variable must exist");
exports.embedColor = (process.env["AYAKA_TICTACTOE_EMBED_COLOR"] ?? "#40E0D0");
exports.maintenance = process.env["AYAKA_TICTACTOE_MAINTENANCE"] === "yes";
exports.owners = process.env["AYAKA_TICTACTOE_OWNERS"]?.split(",") ?? [];
exports.servers = process.env["AYAKA_TICTACTOE_SERVERS"]?.split(",") ?? [];
exports.mongoDatabase = process.env["AYAKA_TICTACTOE_MONGO_DATABASE"] ?? "ayaka-tictactoe";
