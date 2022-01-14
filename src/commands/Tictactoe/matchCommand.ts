import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from "discord.js";
import { Cell, GameStatus } from "tic-tac-toe-minimax-engine";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { Ayaka, themeOf } from "../../utils/Themes";
import { guildsGames, Tictactoe } from "../../utils/Tictactoe";
import { numEmojis, register } from "../../utils/Util"

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

        const games = guildsGames.get(ctx.guildId!) ?? new Map<string, Tictactoe>()
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

        const players: [string, string] = Math.round(Math.random())
            ? [ctx.user.id, user.id]
            : [user.id, ctx.user.id]
        const firstTurn = Math.random() > 0.5

        game = new Tictactoe(Ayaka, players, firstTurn)

        const authorProfile = (
            await db.profile.get(`${ctx.guildId!}-${ctx.user.id}`) ??
                defaultProfile(ctx.guildId!, ctx.user.id)
        ).value

        game.theme = themeOf(authorProfile.theme.used)

        let status = GameStatus.ONGOING

        const mainImg = await game.draw()
        const mainAttachment = new MessageAttachment(mainImg, "tictactoe.jpg")
        const mainEmbed = this.buildEmbed(game, status)

        await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: this.buildRows(game)
        })

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => (
                status === GameStatus.ONGOING &&
                    game!.players.includes(button.user.id)
            )
        })

        collector.on("collect", async button => {
            await button.deferUpdate()

            const index = parseInt(button.customId.split("-")[1])

            const columnIndex = index % 3
            const rowIndex = Math.floor(index / 3)

            if (game!.cells[index] !== Cell.EMPTY) return

            status = game!.fill(rowIndex, columnIndex)

            const img = await game!.draw()
            const attachment = new MessageAttachment(img, "tictactoe.jpg")
            const embed = this.buildEmbed(game!, status)

            await ctx.editReply({
                files: [attachment],
                embeds: [embed],
                components: this.buildRows(game!)
            })

            if (status !== GameStatus.ONGOING) collector.stop()
        })

        collector.once("end", async () => {
            if (status === GameStatus.ONGOING) status = GameStatus.DRAW

            const img = await game!.draw(status)
            const attachment = new MessageAttachment(img, "tictactoe.jpg")
            const embed = this.buildEmbed(game!, status)
            const embeds = [embed]

            if (status !== GameStatus.DRAW) {
                const winner = game!.players[game!.playerID]
                const loser = game!.players.find(id => id !== winner)

                const winnerProfile = await db.profile.get(`${ctx.guildId!}-${winner}`) ?? defaultProfile(ctx.guildId!, winner)
                const loserProfile = await db.profile.get(`${ctx.guildId!}-${loser}`)

                if (loserProfile) {
                    loserProfile.value.streak = 0
                    await db.profile.set(`${ctx.guildId!}-${loser}`, loserProfile.value)
                }

                const bonus = Math.floor(winnerProfile.value.streak * 1.45)

                winnerProfile.value.streak++
                winnerProfile.value.points += 1 + bonus

                await db.profile.set(`${ctx.guildId!}-${winner}`, winnerProfile.value)

                embeds.push(
                    new MessageEmbed()
                        .setDescription(
                            `<@${winner}> Got 1 (+${bonus}) points\n` +
                            `<@${loser}> Lose their streak`
                        )
                        .setColor(embedColor)
                )
            }

            await ctx.editReply({
                embeds,
                files: [attachment],
                components: this.buildRows(game!, true)
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

    private buildRows(game: Tictactoe, end = false): MessageActionRow[] {
        const rows: MessageActionRow[] = []

        for (let i = 0; i < game.cells.length; i += 3) {
            const row = new MessageActionRow()

            for (let j = 0; j < 3; j++) {
                const index = i + j
                const cell = game.cells[index]

                row.addComponents(
                    new MessageButton()
                        .setLabel(numEmojis[index])
                        .setCustomId(`tictactoe-${index}`)
                        .setDisabled(end || cell !== Cell.EMPTY)
                        .setStyle(
                            cell === Cell.EMPTY
                                ? "SECONDARY"
                                : cell === Cell.PLAYER_ONE_TAKEN
                                    ? "DANGER"
                                    : "PRIMARY"
                        )
                )
            }

            rows.push(row)
        }

        return rows
    }

    private buildEmbed(game: Tictactoe, status: GameStatus): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle("Tictactoe")
            .addFields({
                name: "Player One",
                value: `<@${game.players[0]}>`,
                inline: true
            }, {
                name: "Player Two",
                value: `<@${game.players[1]}>`,
                inline: true
            })
            .setColor(embedColor)
            .setImage("attachment://tictactoe.jpg")

        const player = game.players[game.playerID]

        if (status === GameStatus.ONGOING) {
            embed.addFields({
                name: "Turn",
                value: `<@${player}>`
            })
        } else if (status === GameStatus.DRAW) {
            embed.addFields({
                name: "Status",
                value: "No one wins"
            })
        } else {
            embed.addFields({
                name: "Status",
                value: `<@${player}> Win`
            })
        }

        return embed
    }
}
