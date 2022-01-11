import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommandErrorPayload, Listener, ListenerOptions } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";
import { embedColor } from "../config";

@ApplyOptions<ListenerOptions>({
    name: "chatInputCommandError"
})
export class CommandErrorEvent extends Listener {
    public override run(
        _: unknown,
        { interaction, command }: ChatInputCommandErrorPayload
    ): void {
        this.container.logger.error(
            "Command Error:", command.name,
            "-", "User:", interaction.user.id,
            "-", "Channel:", interaction.channel?.id ?? "DM",
            "-", "Guild:", interaction.guild?.id ?? "N/A"
        )

        const embed = new MessageEmbed()
            .setDescription("There's an error when running the command")
            .setColor(embedColor)

        if (!interaction.deferred) {
            void interaction.reply({
                ephemeral: true,
                embeds: [embed]
            })
        } else {
            void interaction.editReply({ content: null, embeds: [embed], components: [] })
        }
    }
}
