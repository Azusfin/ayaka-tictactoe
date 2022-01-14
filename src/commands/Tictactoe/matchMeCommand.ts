import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { MessageEmbed, CommandInteraction, Message } from "discord.js";
import { Cell, GameStatus } from "tic-tac-toe-minimax-engine";
import { embedColor } from "../../config";
import { db, defaultProfile } from "../../structures/AyakaDatabase";
import { Ayaka, themeOf } from "../../utils/Themes";
import { guildsGames, Tictactoe } from "../../utils/Tictactoe";
import { register } from "../../utils/Util";

@ApplyOptions<CommandOptions>({
    name: "matchme",
    description: "Challenge me (The Unbeatable Tictactoe AI) to play tictactoe",
    preconditions: ["allowMaintenance", "GuildOnly"]
})
export class MatchMeCommand extends Command {
    public override async chatInputRun(ctx: CommandInteraction): Promise<void> {
        const clientID = this.container.client.user!.id

        let games = guildsGames.get(ctx.guildId!) ?? new Map<string, Tictactoe>()
        let game = games.get(ctx.user.id)

        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)]
            })
            return
        }

        await ctx.deferReply()

        const players: [string, string] = Math.round(Math.random())
            ? [ctx.user.id, clientID]
            : [clientID, ctx.user.id]
        const firstTurn = Math.random() > 0.5

        game = new Tictactoe(Ayaka, players, firstTurn)
        games.set(ctx.user.id, game)

        guildsGames.set(ctx.guildId!, games)

        const authorProfile = (
            await db.getProfile(ctx.guildId!, ctx.user.id) ??
                defaultProfile(ctx.guildId!, ctx.user.id)
        ).value

        game.theme = themeOf(authorProfile.theme.used)

        let status = GameStatus.ONGOING

        if (players[game.playerID] === clientID) {
            const { x, y } = game.engine.getBestMove()
            status = game.fill(x, y)
        }

        const mainAttachment = await game.buildImg()
        const mainEmbed = game.buildEmbed(status, false)

        const msg = await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: game.buildRows()
        }) as Message

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => (
                ctx.user.id === button.user.id && (
                    button.customId === "tictactoe-delete" ||
                        status === GameStatus.ONGOING
                )
            )
        })

        collector.on("collect", async button => {
            if (button.customId === "tictactoe-delete") {
                await button.deferUpdate()
                collector.stop()
            }

            const index = parseInt(button.customId.split("-")[1])

            const columnIndex = index % 3
            const rowIndex = Math.floor(index / 3)

            if (game!.cells[index] !== Cell.EMPTY) return

            await button.deferUpdate()

            status = game!.fill(rowIndex, columnIndex)

            if (status === GameStatus.ONGOING) {
                const { x, y } = game!.engine.getBestMove()
                status = game!.fill(x, y)
            }

            const attachment = await game!.buildImg()
            const embed = game!.buildEmbed(status, false)

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

            guildsGames.set(ctx.guildId!, games)

            const attachment = await game!.buildImg(status)
            const embed = game!.buildEmbed(status, false)
            const embeds = [embed]

            if (status !== GameStatus.DRAW && game!.players[game!.playerID] === ctx.user.id) {
                const profile = await db.getProfile(ctx.guildId!, ctx.user.id) ??
                    defaultProfile(ctx.guildId!, ctx.user.id)

                const bonus = Math.floor(profile.value.streak * 1.45)
                profile.value.points += 1 + bonus

                await db.setProfile(ctx.guildId!, ctx.user.id, profile.value)

                embeds.push(
                    this.makeEmbed(
                        `You got 1 (+${bonus}) points\n` +
                        "_I didn't expected you to win against me_"
                    )
                )
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
