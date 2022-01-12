import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework"
import { CommandInteraction, MessageEmbed } from "discord.js";
import { embedColor, owners } from "../../config";
import humanize from "humanize-duration"
import { register } from "../../utils/Util";

@ApplyOptions<CommandOptions>({
    name: "stats",
    description: "Show the bot statistics"
})
export class statsCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const botName = this.container.client.user!.username
        const botAvatar = this.container.client.user!.displayAvatarURL({ format: "jpg" })
        const servers = this.container.client.guilds.cache.size.toLocaleString("en-us")
        const users = this.container.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
        const allCursor = await this.container.client.db.profile.all()
        const players = await allCursor.cursor.count()
        const uptime = humanize(this.container.client.uptime!, { maxDecimalPoints: 0 })
        const library = "Discord.js"
        const botOwners = owners.map(
            ownerID => this.container.client.users.cache.get(ownerID)?.tag ?? `${ownerID} (N/A)`
        ).join("\n")

        const memory = process.memoryUsage()
        const memoryOs = (memory.rss / 1024 / 1024).toFixed(2)
        const memoryJsTotal = (memory.heapTotal / 1024 / 1024).toFixed(2)
        const memoryJsUsed = (memory.heapUsed / 1024 / 1024).toFixed(2)
        const memoryExternal = (memory.external / 1024 / 1024).toFixed(2)
        const memoryBuffers = (memory.arrayBuffers / 1024 / 1024).toFixed(2)

        const embed = new MessageEmbed()
            .setAuthor({
                name: botName,
                iconURL: botAvatar
            })
            .setThumbnail(botAvatar)
            .addFields({
                name: "Servers",
                value: servers,
                inline: true
            }, {
                name: "Users",
                value: users.toLocaleString("en-us"),
                inline: true
            }, {
                name: "Players",
                value: players.toLocaleString("en-us"),
                inline: true
            }, {
                name: "Uptime",
                value: uptime,
                inline: true
            }, {
                name: "Library",
                value: library,
                inline: true
            }, {
                name: "Owners",
                value: `\`\`\`\n${botOwners}\`\`\``
            }, {
                name: "Memory",
                value: `\`\`\`\nOS: ${memoryOs}MiB\n` +
                    `JsTotal: ${memoryJsTotal}MiB\n` +
                    `JsUsed: ${memoryJsUsed}MiB\n` +
                    `External: ${memoryExternal}MiB\n` +
                    `Buffers: ${memoryBuffers}MiB\`\`\``
            })
            .setColor(embedColor)

        await interaction.reply({
            ephemeral: true,
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
