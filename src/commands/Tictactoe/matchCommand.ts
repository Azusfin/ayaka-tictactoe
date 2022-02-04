import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Cell, GameStatus } from "tic-tac-toe-minimax-engine";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { Ayaka, themeOf } from "../../utils/Themes";
import { guildsGames, Tictactoe } from "../../utils/Tictactoe";
import { register } from "../../utils/Util"

@ApplyOptions<CommandOptions>({
    name: "match",
    description: "Challenge someone to play tictactoe",
    detailedDescription: "<user>",
    preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
})
export class MatchCommand extends Command {
    public override async chatInputRun(ctx: CommandInteraction): Promise<void> {
        const user = ctx.options.getUser("user", true)

        if (user.id === ctx.user.id) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("You can't play with yourself, try play with me dear")]
            })
            return
        }

        let games = guildsGames.get(ctx.guildId!) ?? new Map<string, Tictactoe>()
        let game = games.get(ctx.user.id)

        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)]
            })
            return
        }

        game = games.get(user.id)

        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`They still had a game with <@${game.players.find(id => id !== user.id)}>`)]
            })
            return
        }

        const msg = await ctx.reply({
            fetchReply: true,
            embeds: [this.makeEmbed(`<@${user.id}> Do you accept this challenge?`)],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel("✅")
                            .setCustomId("match-accept")
                            .setStyle("SUCCESS"),
                        new MessageButton()
                            .setLabel("❌")
                            .setCustomId("match-decline")
                            .setStyle("DANGER")
                    )
            ]
        }) as Message

        try {
            const button = await msg.awaitMessageComponent({
                componentType: "BUTTON",
                time: 30e3,
                filter(button) {
                    return button.user.id === user.id
                }
            })

            await button.deferUpdate()

            const accepted = button.customId === "match-accept"

            if (!accepted) {
                await ctx.editReply({
                    embeds: [this.makeEmbed(`<@${user.id}> Declined the request`)],
                    components: []
                })
                return
            }
        } catch {
            await ctx.editReply({
                embeds: [this.makeEmbed(`<@${user.id}> Took too long to respond`)],
                components: []
            })
            return
        }

        games = guildsGames.get(ctx.guildId!) ?? new Map<string, Tictactoe>()
        game = games.get(ctx.user.id)

        if (game) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)],
                components: []
            })
            return
        }

        game = games.get(user.id)

        if (game) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`They still had a game with <@${game.players.find(id => id !== user.id)}>`)],
                components: []
            })
            return
        }

        const players: [string, string] = Math.round(Math.random())
            ? [ctx.user.id, user.id]
            : [user.id, ctx.user.id]
        const firstTurn = Math.random() > 0.5

        game = new Tictactoe(Ayaka, players, firstTurn)

        games.set(ctx.user.id, game)
        games.set(user.id, game)

        guildsGames.set(ctx.guildId!, games)

        const authorProfile = (
            await db.getProfile(ctx.guildId!, ctx.user.id) ??
                defaultProfile(ctx.guildId!, ctx.user.id)
        ).value

        game.theme = themeOf(authorProfile.theme.used)

        let status = GameStatus.ONGOING

        const mainAttachment = await game.buildImg()
        const mainEmbed = game.buildEmbed(status)

        await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: game.buildRows()
        })

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => (
                button.customId !== "tictactoe-end"
                    ? status === GameStatus.ONGOING &&
                        game!.players[game!.playerID] === button.user.id
                    : game!.players.includes(button.user.id)
            )
        })

        collector.on("collect", async button => {
            if (button.customId === "tictactoe-end") {
                await button.deferUpdate()
                collector.stop()
                return
            }

            const index = parseInt(button.customId.split("-")[1])

            const columnIndex = index % 3
            const rowIndex = Math.floor(index / 3)

            if (game!.cells[index] !== Cell.EMPTY) return

            await button.deferUpdate()

            status = game!.fill(rowIndex, columnIndex)

            const attachment = await game!.buildImg()
            const embed = game!.buildEmbed(status)

            await ctx.editReply({
                files: [attachment],
                embeds: [embed],
                components: game!.buildRows()
            })

            if (status !== GameStatus.ONGOING) collector.stop()
        })

        collector.once("end", async () => {
            if (status === GameStatus.ONGOING) status = GameStatus.DRAW

            games = guildsGames.get(ctx.guildId!) ?? new Map<string, Tictactoe>()
            games.delete(ctx.user.id)
            games.delete(user.id)

            guildsGames.set(ctx.guildId!, games)

            const attachment = await game!.buildImg(status)
            const embed = game!.buildEmbed(status)
            const embeds = [embed]

            if (status !== GameStatus.DRAW) {
                const winner = game!.players[game!.playerID]
                const loser = game!.players.find(id => id !== winner)!

                const winnerProfile = await db.getProfile(ctx.guildId!, winner) ??
                    defaultProfile(ctx.guildId!, winner)
                const loserProfile = await db.getProfile(ctx.guildId!, loser)

                if (loserProfile) {
                    loserProfile.value.streak = 0
                    await db.setProfile(ctx.guildId!, loser, loserProfile.value)
                }

                const bonus = Math.floor(winnerProfile.value.streak * 1.45)

                winnerProfile.value.points += 1 + bonus

                embeds.push(
                    this.makeEmbed(
                        `<@${winner}> Got 1 (+${bonus}) points\n` +
                        `<@${winner}> Now have a total of ${winnerProfile.value.points.toLocaleString("en-us")} points\n` +
                        `<@${winner}> Streak: ${winnerProfile.value.streak}\n` +
                        `<@${loser}> Lose their streak`
                    )
                )

                winnerProfile.value.streak++
                await db.setProfile(ctx.guildId!, winner, winnerProfile.value)
            }

            await ctx.editReply({
                embeds,
                files: [attachment],
                components: game!.buildRows(true)
            })
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
                            .setDescription("The user to match to")
                            .setRequired(true)
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
