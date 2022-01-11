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
