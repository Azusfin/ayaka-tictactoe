import { Theme } from "./Themes"
import { Canvas } from "canvas-constructor/cairo"
import { OImg, XImg } from "./img/XO"
import TictactoeEngine, { Player, Cell, GameStatus } from "tic-tac-toe-minimax-engine"
import { MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from "discord.js"
import { numEmojis } from "./Util"
import { embedColor } from "../config"

export type guildGames = Map<string, Tictactoe>
export const guildsGames = new Map<string, guildGames>()

export class Tictactoe {
    public theme: Theme
    public players: [string, string]
    public engine: TictactoeEngine
    public turn: Player
    public cells = [
        Cell.EMPTY, Cell.EMPTY, Cell.EMPTY,
        Cell.EMPTY, Cell.EMPTY, Cell.EMPTY,
        Cell.EMPTY, Cell.EMPTY, Cell.EMPTY
    ]

    public constructor(theme: Theme, players: [string, string], firstTurn: boolean) {
        this.theme = theme
        this.players = players
        this.turn = firstTurn ? Player.PLAYER_ONE : Player.PLAYER_TWO
        this.engine = new TictactoeEngine(this.turn)
    }

    public get playerID(): 0 | 1 {
        return this.turn === Player.PLAYER_ONE ? 0 : 1
    }

    public fill(row: number, column: number): GameStatus {
        const prevTurn = this.turn
        const status = this.engine.makeNextMove(row, column)

        this.cells[(row * 3) + column] = prevTurn === Player.PLAYER_ONE
            ? Cell.PLAYER_ONE_TAKEN
            : Cell.PLAYER_TWO_TAKEN

        if (status === GameStatus.ONGOING) {
            this.turn = prevTurn === Player.PLAYER_ONE
                ? Player.PLAYER_TWO
                : Player.PLAYER_ONE
        }

        return status
    }

    public buildRows(end = false): MessageActionRow[] {
        const rows: MessageActionRow[] = []

        for (let i = 0; i < this.cells.length; i += 3) {
            const row = new MessageActionRow()

            for (let j = 0; j < 3; j++) {
                const index = i + j
                const cell = this.cells[index]

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

    public buildEmbed(status: GameStatus, withTurn = true): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle("Tictactoe")
            .addFields({
                name: "Player One",
                value: `<@${this.players[0]}>`,
                inline: true
            }, {
                name: "Player Two",
                value: `<@${this.players[1]}>`,
                inline: true
            })
            .setColor(embedColor)
            .setImage("attachment://tictactoe.jpg")

        const player = this.players[this.playerID]

        if (status === GameStatus.ONGOING) {
            if (withTurn) {
                embed.addFields({
                    name: "Turn",
                    value: `<@${player}>`
                })
            }
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

    public async buildImg(status?: GameStatus): Promise<MessageAttachment> {
        const img = await this.draw(status)
        return new MessageAttachment(img, "tictactoe.jpg")
    }

    private async draw(status?: GameStatus): Promise<Buffer> {
        const { theme, cells, turn } = this

        const canvas = new Canvas(theme.size.width, theme.size.height)

        const img = await theme.img
        canvas.printImage(img, 0, 0)

        const xImg = await XImg
        const oImg = await OImg

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i]

            if (cell === Cell.EMPTY) continue

            const horizontalIndex = i % 3
            const verticalIndex = Math.floor(i / 3)

            const xPos = horizontalIndex === 0
                ? theme.position.horizontal.first
                : horizontalIndex === 1
                    ? theme.position.horizontal.second
                    : theme.position.horizontal.third
            const yPos = verticalIndex === 0
                ? theme.position.vertical.first
                : verticalIndex === 1
                    ? theme.position.vertical.second
                    : theme.position.vertical.third

            const xoImg = cell === Cell.PLAYER_ONE_TAKEN ? xImg : oImg

            canvas.printImage(xoImg, xPos, yPos, theme.size.xo, theme.size.xo)
        }

        if (status !== undefined) {
            const expectedCell = turn === Player.PLAYER_ONE
                ? Cell.PLAYER_ONE_TAKEN
                : Cell.PLAYER_TWO_TAKEN

            canvas
                .setStroke("#202020")
                .setStrokeWidth(Math.floor(theme.size.xo / 10))

            if (status === GameStatus.WIN_ON_VERTICAL) {
                let index!: number

                for (let i = 0; i < cells.length; i += 3) {
                    const cell0 = cells[i]
                    const cell1 = cells[i + 1]
                    const cell2 = cells[i + 2]

                    if (
                        cell0 === expectedCell &&
                        cell1 === expectedCell &&
                        cell2 === expectedCell
                    ) {
                        index = Math.floor(i / 3)
                        break
                    }
                }

                const xStart = theme.position.horizontal.first
                const xEnd = theme.position.horizontal.third + theme.lineOffset

                const y = index === 0
                    ? theme.position.vertical.first
                    : index === 1
                        ? theme.position.vertical.second
                        : theme.position.vertical.third

                canvas
                    .moveTo(xStart, y + (theme.size.xo / 2))
                    .lineTo(xEnd, y + (theme.size.xo / 2))
                    .stroke()
            } else if (status === GameStatus.WIN_ON_HORIZONTAL) {
                let index!: number

                for (let i = 0; i < 3; i++) {
                    const cell0 = cells[i]
                    const cell1 = cells[i + 3]
                    const cell2 = cells[i + 6]

                    if (
                        cell0 === expectedCell &&
                        cell1 === expectedCell &&
                        cell2 === expectedCell
                    ) {
                        index = i
                        break
                    }
                }

                const yStart = theme.position.vertical.first
                const yEnd = theme.position.vertical.third + theme.lineOffset

                const x = index === 0
                    ? theme.position.horizontal.first
                    : index === 1
                        ? theme.position.horizontal.second
                        : theme.position.horizontal.third

                canvas
                    .moveTo(x + (theme.size.xo / 2), yStart)
                    .lineTo(x + (theme.size.xo / 2), yEnd)
                    .stroke()
            } else if (status === GameStatus.WIN_ON_LEFT_DIAGONAL) {
                const xStart = theme.position.horizontal.third + theme.lineOffset
                const xEnd = theme.position.horizontal.first

                const yStart = theme.position.vertical.first
                const yEnd = theme.position.vertical.third + theme.lineOffset

                canvas
                    .moveTo(xStart, yStart)
                    .lineTo(xEnd, yEnd)
                    .stroke()
            } else if (status === GameStatus.WIN_ON_RIGHT_DIAGONAL) {
                const xStart = theme.position.horizontal.first
                const xEnd = theme.position.horizontal.third + theme.lineOffset

                const yStart = theme.position.vertical.first
                const yEnd = theme.position.vertical.third + theme.lineOffset

                canvas
                    .moveTo(xStart, yStart)
                    .lineTo(xEnd, yEnd)
                    .stroke()
            }
        }

        return canvas.toBufferAsync("image/jpeg", { quality: theme.quality })
    }
}
