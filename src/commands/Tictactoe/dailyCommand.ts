import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import humanizeDuration from "humanize-duration";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { register } from "../../utils/Util";

const cooldown = 20 * 60 * 60 * 1000
const streakLimit = 24 * 60 * 60 * 1000

const dailyMin = 16
const dailyMax = 34

@ApplyOptions<CommandOptions>({
    name: "daily",
    description: "Claim your daily rewards",
    preconditions: ["allowMaintenance", "GuildOnly"]
})
export class DailyCommand extends Command {
    public override async chatInputRun(ctx: CommandInteraction): Promise<void> {
        await ctx.deferReply({ ephemeral: true })

        const current = new Date()
        const profile = (
            await db.getProfile(ctx.guildId!, ctx.user.id) ??
                defaultProfile(ctx.guildId!, ctx.user.id)
        ).value

        const gap = current.getTime() - profile.lastDaily.getTime()

        if (gap < cooldown) {
            await ctx.editReply({
                embeds: [this.makeEmbed(
                    `You can only claim daily reward every ${humanizeDuration(cooldown)}\n` +
                    `Please wait \`${humanizeDuration(cooldown - gap, { maxDecimalPoints: 0 })}\` more`
                )]
            })
            return
        }

        const embeds: MessageEmbed[] = []

        if (profile.lastDaily.getFullYear() > 2015 && gap > streakLimit) {
            embeds.push(this.makeEmbed(
                `You hit max time limit from your last daily, you lose your \`${profile.dailyStreak}\` daily streak\n` +
                `You last claimed your daily on <t:${Math.floor(profile.lastDaily.getTime() / 1000)}>`
            ))
            profile.dailyStreak = 0
        }

        const amount = Math.floor((Math.random() * (dailyMax - dailyMin + 1)) + dailyMin)
        const bonus = Math.floor(profile.dailyStreak / dailyMin * amount)

        profile.points += amount + bonus
        profile.lastDaily = current

        embeds.push(
            this.makeEmbed(
                `Claimed ${amount} (+${bonus}) points\n` +
                `You now have a total of ${profile.points.toLocaleString("en-us")} points\n`
            ).setFooter({
                text: `Daily streak: ${profile.dailyStreak}`
            })
        )

        profile.dailyStreak++

        await db.setProfile(ctx.guildId!, ctx.user.id, profile)
        await ctx.editReply({ embeds })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        register(
            registry,
            builder => builder
                .setName(this.name)
                .setDescription(this.description)
        )
    }

    private makeEmbed(content: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(content)
            .setColor(embedColor)
    }
}
