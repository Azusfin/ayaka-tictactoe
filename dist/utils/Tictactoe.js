"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tictactoe = exports.guildsGames = void 0;
const cairo_1 = require("canvas-constructor/cairo");
const XO_1 = require("./img/XO");
const tic_tac_toe_minimax_engine_1 = __importStar(require("tic-tac-toe-minimax-engine"));
const discord_js_1 = require("discord.js");
const Util_1 = require("./Util");
const config_1 = require("../config");
exports.guildsGames = new Map();
class Tictactoe {
    constructor(theme, players, firstTurn) {
        this.cells = [
            tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY,
            tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY,
            tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY, tic_tac_toe_minimax_engine_1.Cell.EMPTY
        ];
        this.theme = theme;
        this.players = players;
        this.turn = firstTurn ? tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE : tic_tac_toe_minimax_engine_1.Player.PLAYER_TWO;
        this.engine = new tic_tac_toe_minimax_engine_1.default(this.turn);
    }
    get playerID() {
        return this.turn === tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE ? 0 : 1;
    }
    fill(row, column) {
        const prevTurn = this.turn;
        const status = this.engine.makeNextMove(row, column);
        this.cells[(row * 3) + column] = prevTurn === tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE
            ? tic_tac_toe_minimax_engine_1.Cell.PLAYER_ONE_TAKEN
            : tic_tac_toe_minimax_engine_1.Cell.PLAYER_TWO_TAKEN;
        if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING) {
            this.turn = prevTurn === tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE
                ? tic_tac_toe_minimax_engine_1.Player.PLAYER_TWO
                : tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE;
        }
        return status;
    }
    buildRows(end = false) {
        const rows = [];
        for (let i = 0; i < this.cells.length; i += 3) {
            const row = new discord_js_1.MessageActionRow();
            for (let j = 0; j < 3; j++) {
                const index = i + j;
                const cell = this.cells[index];
                row.addComponents(new discord_js_1.MessageButton()
                    .setLabel(Util_1.numEmojis[index])
                    .setCustomId(`tictactoe-${index}`)
                    .setDisabled(end || cell !== tic_tac_toe_minimax_engine_1.Cell.EMPTY)
                    .setStyle(cell === tic_tac_toe_minimax_engine_1.Cell.EMPTY
                    ? "SECONDARY"
                    : cell === tic_tac_toe_minimax_engine_1.Cell.PLAYER_ONE_TAKEN
                        ? "DANGER"
                        : "PRIMARY"));
            }
            rows.push(row);
        }
        rows.push(new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setLabel("⏰")
            .setCustomId("tictactoe-end")
            .setDisabled(end)
            .setStyle("SUCCESS")));
        return rows;
    }
    buildEmbed(status, withTurn = true) {
        const embed = new discord_js_1.MessageEmbed()
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
            .setColor(config_1.embedColor)
            .setImage("attachment://tictactoe.jpg");
        const player = this.players[this.playerID];
        if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING) {
            if (withTurn) {
                embed.addFields({
                    name: "Turn",
                    value: `<@${player}>`
                });
            }
        }
        else if (status === tic_tac_toe_minimax_engine_1.GameStatus.DRAW) {
            embed.addFields({
                name: "Status",
                value: "No one wins"
            });
        }
        else {
            embed.addFields({
                name: "Status",
                value: `<@${player}> Win`
            });
        }
        return embed;
    }
    async buildImg(status) {
        const img = await this.draw(status);
        return new discord_js_1.MessageAttachment(img, "tictactoe.jpg");
    }
    async draw(status) {
        const { theme, cells, turn } = this;
        const canvas = new cairo_1.Canvas(theme.size.width, theme.size.height);
        const img = await theme.img;
        canvas.printImage(img, 0, 0);
        const xImg = await XO_1.XImg;
        const oImg = await XO_1.OImg;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell === tic_tac_toe_minimax_engine_1.Cell.EMPTY)
                continue;
            const horizontalIndex = i % 3;
            const verticalIndex = Math.floor(i / 3);
            const xPos = horizontalIndex === 0
                ? theme.position.horizontal.first
                : horizontalIndex === 1
                    ? theme.position.horizontal.second
                    : theme.position.horizontal.third;
            const yPos = verticalIndex === 0
                ? theme.position.vertical.first
                : verticalIndex === 1
                    ? theme.position.vertical.second
                    : theme.position.vertical.third;
            const xoImg = cell === tic_tac_toe_minimax_engine_1.Cell.PLAYER_ONE_TAKEN ? xImg : oImg;
            canvas.printImage(xoImg, xPos, yPos, theme.size.xo, theme.size.xo);
        }
        if (status !== undefined) {
            const expectedCell = turn === tic_tac_toe_minimax_engine_1.Player.PLAYER_ONE
                ? tic_tac_toe_minimax_engine_1.Cell.PLAYER_ONE_TAKEN
                : tic_tac_toe_minimax_engine_1.Cell.PLAYER_TWO_TAKEN;
            canvas
                .setStroke("#202020")
                .setStrokeWidth(Math.floor(theme.size.xo / 10));
            if (status === tic_tac_toe_minimax_engine_1.GameStatus.WIN_ON_VERTICAL) {
                let index;
                for (let i = 0; i < cells.length; i += 3) {
                    const cell0 = cells[i];
                    const cell1 = cells[i + 1];
                    const cell2 = cells[i + 2];
                    if (cell0 === expectedCell &&
                        cell1 === expectedCell &&
                        cell2 === expectedCell) {
                        index = Math.floor(i / 3);
                        break;
                    }
                }
                const xStart = theme.position.horizontal.first;
                const xEnd = theme.position.horizontal.third + theme.lineOffset;
                const y = index === 0
                    ? theme.position.vertical.first
                    : index === 1
                        ? theme.position.vertical.second
                        : theme.position.vertical.third;
                canvas
                    .moveTo(xStart, y + (theme.size.xo / 2))
                    .lineTo(xEnd, y + (theme.size.xo / 2))
                    .stroke();
            }
            else if (status === tic_tac_toe_minimax_engine_1.GameStatus.WIN_ON_HORIZONTAL) {
                let index;
                for (let i = 0; i < 3; i++) {
                    const cell0 = cells[i];
                    const cell1 = cells[i + 3];
                    const cell2 = cells[i + 6];
                    if (cell0 === expectedCell &&
                        cell1 === expectedCell &&
                        cell2 === expectedCell) {
                        index = i;
                        break;
                    }
                }
                const yStart = theme.position.vertical.first;
                const yEnd = theme.position.vertical.third + theme.lineOffset;
                const x = index === 0
                    ? theme.position.horizontal.first
                    : index === 1
                        ? theme.position.horizontal.second
                        : theme.position.horizontal.third;
                canvas
                    .moveTo(x + (theme.size.xo / 2), yStart)
                    .lineTo(x + (theme.size.xo / 2), yEnd)
                    .stroke();
            }
            else if (status === tic_tac_toe_minimax_engine_1.GameStatus.WIN_ON_LEFT_DIAGONAL) {
                const xStart = theme.position.horizontal.third + theme.lineOffset;
                const xEnd = theme.position.horizontal.first;
                const yStart = theme.position.vertical.first;
                const yEnd = theme.position.vertical.third + theme.lineOffset;
                canvas
                    .moveTo(xStart, yStart)
                    .lineTo(xEnd, yEnd)
                    .stroke();
            }
            else if (status === tic_tac_toe_minimax_engine_1.GameStatus.WIN_ON_RIGHT_DIAGONAL) {
                const xStart = theme.position.horizontal.first;
                const xEnd = theme.position.horizontal.third + theme.lineOffset;
                const yStart = theme.position.vertical.first;
                const yEnd = theme.position.vertical.third + theme.lineOffset;
                canvas
                    .moveTo(xStart, yStart)
                    .lineTo(xEnd, yEnd)
                    .stroke();
            }
        }
        return canvas.toBufferAsync("image/jpeg", { quality: theme.quality });
    }
}
exports.Tictactoe = Tictactoe;
