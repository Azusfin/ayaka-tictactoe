import "dotenv/config"
import { ColorResolvable } from "discord.js"
import { AyakaError } from "./structures/AyakaError"

export const token = process.env["AYAKA_TICTACTOE_TOKEN"]!

if (!token) throw new AyakaError("CONFIG", "AYAKA_TICTACTOE_TOKEN environment variable must exist")

export const mongoURL = process.env["AYAKA_TICTACTOE_MONGO_URL"]!

if (!mongoURL) throw new AyakaError("CONFIG", "AYAKA_TICTACTOE_MONGO_URL environment variable must exist")

export const embedColor = (process.env["AYAKA_TICTACTOE_EMBED_COLOR"] ?? "#40E0D0") as ColorResolvable
export const maintenance = process.env["AYAKA_TICTACTOE_MAINTENANCE"] === "yes"
export const owners = process.env["AYAKA_TICTACTOE_OWNERS"]?.split(",") ?? []
export const servers = process.env["AYAKA_TICTACTOE_SERVERS"]?.split(",") ?? []
export const mongoDatabase = process.env["AYAKA_TICTACTOE_MONGO_DATABASE"] ?? "ayaka-tictactoe"
