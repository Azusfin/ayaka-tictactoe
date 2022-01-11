import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { embedColor } from "../../config";
import { register } from "../../utils/Util";

@ApplyOptions<CommandOptions>({
    name: "ping",
    description: "Ping pong 🏓"
})
export class PingCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const embed = new MessageEmbed()
            .setTitle("Pong! 🏓")
            .addFields({ name: "WS", value: `${this.container.client.ws.ping}ms`, inline: true })
            .setColor(embedColor)

        const before = Date.now()
        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        })

        embed.addFields({ name: "REST", value: `${Date.now() - before}ms`, inline: true })

        await interaction.editReply({
            embeds: [embed]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        register(
            registry,
            builder => builder
                .setName(this.name)
                .setDescription(this.description)
        )
    }
}
