import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction, MessageEmbed } from "discord.js";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { register } from "../../utils/Util";

const validInteger = /^\d+$/

@ApplyOptions<CommandOptions>({
    name: "give",
    description: "Give some points to another user",
    detailedDescription: "<user> <amount>",
    preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
})
export class GiveCommand extends Command {
    public override async chatInputRun(ctx: CommandInteraction): Promise<void> {
        const user = ctx.options.getUser("user", true)
        const amount = ctx.options.getInteger("amount", true)

        await ctx.deferReply()

        const profile = (
            await db.getProfile(ctx.guildId!, ctx.user.id) ??
                defaultProfile(ctx.guildId!, ctx.user.id)
        ).value

        if (amount > profile.points) {
            await ctx.editReply({
                embeds: [this.makeEmbed(
                    "You cannot give them more than what you have\n" +
                    `Current Points: ${profile.points.toLocaleString("en-us")}\n` +
                    `Amount To GIve: ${amount.toLocaleString("en-us")}`
                )]
            })
            return
        }

        const targetProfile = (
            await db.getProfile(ctx.guildId!, user.id) ??
                defaultProfile(ctx.guildId!, user.id)
        ).value

        const before = profile.points
        const targetBefore = targetProfile.points

        profile.points -= amount
        targetProfile.points += amount

        await Promise.all([
            db.setProfile(ctx.guildId!, ctx.user.id, profile),
            db.setProfile(ctx.guildId!, user.id, targetProfile)
        ])

        await ctx.editReply({
            embeds: [this.makeEmbed(
                `Amount: ${amount.toLocaleString("en-us")}\n` +
                `<@${ctx.user.id}>: ${before.toLocaleString("en-us")} -> ${profile.points.toLocaleString("en-us")}\n` +
                `<@${user.id}>: ${targetBefore.toLocaleString("en-us")} -> ${targetProfile.points.toLocaleString("en-us")}`
            )]
        })
    }

    public override async autocompleteRun(ctx: AutocompleteInteraction): Promise<void> {
        const amount = ctx.options.getFocused() as string
        const lowercaseAmount = amount.toLowerCase()

        if (
            ctx.guildId &&
            (
                (
                    amount !== "" &&
                    "all".startsWith(lowercaseAmount)
                ) ||
                (
                    validInteger.test(amount) &&
                    parseInt(amount) > 0
                )
            )
        ) {
            const profile = (
                await db.getProfile(ctx.guildId, ctx.user.id) ??
                    defaultProfile(ctx.guildId, ctx.user.id)
            ).value

            const choices: ApplicationCommandOptionChoice[] = [{ name: "all", value: profile.points }]

            if (validInteger.test(amount)) {
                choices.unshift({
                    name: amount,
                    value: parseInt(amount)
                })
            }

            await ctx.respond(choices)
        } else {
            await ctx.respond([])
        }
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        register(
            registry,
            builder => {
                builder.addUserOption(
                    option => option
                        .setName("user")
                        .setDescription("The user to give the points to")
                        .setRequired(true)
                )

                builder.addIntegerOption(
                    option => option
                        .setName("amount")
                        .setDescription("The amount of points to give to")
                        .setRequired(true)
                        .setMinValue(1)
                        .setAutocomplete(true)
                )

                return builder
                    .setName(this.name)
                    .setDescription(this.description)
            }
        )
    }

    private makeEmbed(content: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(content)
            .setColor(embedColor)
    }
}
