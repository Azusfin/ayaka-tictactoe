import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommandDeniedPayload, Listener, ListenerOptions, UserError } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";
import { embedColor } from "../config";

@ApplyOptions<ListenerOptions>({
    name: "chatInputCommandDenied"
})
export class CommandDeniedEvent extends Listener {
    public override run(
        { context, message: content }: UserError,
        { interaction, command }: ChatInputCommandDeniedPayload
    ): void {
        this.container.logger.warn(
            "Command Denied:", command.name,
            "-", "User:", interaction.user.id,
            "-", "Channel:", interaction.channel?.id ?? "DM",
            "-", "Guild:", interaction.guild?.id ?? "N/A"
        )

        if (Reflect.get(Object(context), "silent")) return

        void interaction.reply({
            ephemeral: true,
            embeds: [
                new MessageEmbed()
                    .setDescription(content)
                    .setColor(embedColor)
            ]
        })
    }
}
