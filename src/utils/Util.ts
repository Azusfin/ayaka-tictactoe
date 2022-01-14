import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandRegistry, RegisterBehavior } from "@sapphire/framework";
import { servers } from "../config";

export function register(
    registry: ApplicationCommandRegistry,
    builder: (builder: SlashCommandBuilder) => SlashCommandBuilder
): void {
    registry.registerChatInputCommand(builder, {
        guildIds: undefined,
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite
    })

    if (servers.length) {
        registry.registerChatInputCommand(builder, {
            guildIds: servers,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite
        })
    }
}

export const numEmojis = [
    "1️⃣", "2️⃣", "3️⃣",
    "4️⃣", "5️⃣", "6️⃣",
    "7️⃣", "8️⃣", "9️⃣"
] as const
