import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageAttachment, MessageEmbed } from "discord.js";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { drawBadges } from "../../utils/Badges";
import { register } from "../../utils/Util";

@ApplyOptions<CommandOptions>({
    name: "profile",
    description: "Get profile info of a user",
    detailedDescription: "<user>",
    preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
})
export class ProfileCommand extends Command {
    public override async chatInputRun(ctx: CommandInteraction): Promise<void> {
        const user = ctx.options.getUser("user", true)

        await ctx.deferReply({ ephemeral: true })

        const profile = (
            await db.getProfile(ctx.guildId!, user.id) ??
                defaultProfile(ctx.guildId!, user.id)
        ).value

        const files = []
        const embed = new MessageEmbed()
            .setTitle(user.tag)
            .setThumbnail(user.displayAvatarURL({ format: "png" }))
            .setColor(embedColor)

        if (profile.bio) {
            embed.addFields({
                name: "Bio",
                value: profile.bio
            })
        }

        embed.addFields({
            name: "Points",
            value: profile.points.toLocaleString("en-us"),
            inline: true
        }, {
            name: "Streak",
            value: profile.streak.toString(),
            inline: true
        }, {
            name: "Theme Used",
            value: profile.theme.used,
            inline: true
        })

        if (profile.badges.length) {
            const buffer = await drawBadges(profile.badges)
            const attachment = new MessageAttachment(buffer, "badges.png")

            files.push(attachment)
            embed.setImage("attachment://badges.png")
        }

        await ctx.editReply({
            files,
            embeds: [embed]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        register(
            registry,
            builder => {
                builder
                    .addUserOption(
                        option => option
                            .setName("user")
                            .setDescription("The user to get the profile from")
                            .setRequired(true)
                    )

                return builder
                    .setName(this.name)
                    .setDescription(this.description)
            }
        )
    }
}
