"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchMeCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const tic_tac_toe_minimax_engine_1 = require("tic-tac-toe-minimax-engine");
const config_1 = require("../../config");
const AyakaDatabase_1 = require("../../structures/AyakaDatabase");
const Themes_1 = require("../../utils/Themes");
const Tictactoe_1 = require("../../utils/Tictactoe");
const Util_1 = require("../../utils/Util");
let MatchMeCommand = class MatchMeCommand extends framework_1.Command {
    async chatInputRun(ctx) {
        const clientID = this.container.client.user.id;
        let games = Tictactoe_1.guildsGames.get(ctx.guildId) ?? new Map();
        let game = games.get(ctx.user.id);
        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)]
            });
            return;
        }
        await ctx.deferReply();
        const players = Math.round(Math.random())
            ? [ctx.user.id, clientID]
            : [clientID, ctx.user.id];
        const firstTurn = Math.random() > 0.5;
        game = new Tictactoe_1.Tictactoe(Themes_1.AYAKA, players, firstTurn);
        games.set(ctx.user.id, game);
        Tictactoe_1.guildsGames.set(ctx.guildId, games);
        const authorProfile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
        game.theme = (0, Themes_1.themeOf)(authorProfile.theme.used);
        let status = tic_tac_toe_minimax_engine_1.GameStatus.ONGOING;
        if (players[game.playerID] === clientID) {
            const { x, y } = game.engine.getBestMove();
            status = game.fill(x, y);
        }
        const mainAttachment = await game.buildImg();
        const mainEmbed = game.buildEmbed(status, false);
        const msg = await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: game.buildRows()
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => ctx.user.id === button.user.id && (button.customId === "tictactoe-end" ||
                status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING)
        });
        collector.on("collect", async (button) => {
            if (button.customId === "tictactoe-end") {
                await button.deferUpdate();
                collector.stop();
                return;
            }
            const index = parseInt(button.customId.split("-")[1]);
            const columnIndex = index % 3;
            const rowIndex = Math.floor(index / 3);
            if (game.cells[index] !== tic_tac_toe_minimax_engine_1.Cell.EMPTY)
                return;
            await button.deferUpdate();
            status = game.fill(rowIndex, columnIndex);
            if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING) {
                const { x, y } = game.engine.getBestMove();
                status = game.fill(x, y);
            }
            const attachment = await game.buildImg();
            const embed = game.buildEmbed(status, false);
            await ctx.editReply({
                files: [attachment],
                embeds: [embed],
                components: game.buildRows()
            });
            if (status !== tic_tac_toe_minimax_engine_1.GameStatus.ONGOING)
                collector.stop();
        });
        collector.once("end", async () => {
            if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING)
                status = tic_tac_toe_minimax_engine_1.GameStatus.DRAW;
            games = Tictactoe_1.guildsGames.get(ctx.guildId) ?? new Map();
            games.delete(ctx.user.id);
            Tictactoe_1.guildsGames.set(ctx.guildId, games);
            const attachment = await game.buildImg(status);
            const embed = game.buildEmbed(status, false);
            const embeds = [embed];
            if (status !== tic_tac_toe_minimax_engine_1.GameStatus.DRAW && game.players[game.playerID] === ctx.user.id) {
                const profile = await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
                    (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id);
                const bonus = Math.floor(profile.value.streak * 1.45);
                profile.value.points += 1 + bonus;
                embeds.push(this.makeEmbed(`You got 1 (+${bonus}) points\n` +
                    `You now have a total of ${profile.value.points.toLocaleString("en-us")} points\n` +
                    `Your streak: ${profile.value.streak}\n` +
                    "_I didn't expect you to win against me_"));
                profile.value.streak++;
                await AyakaDatabase_1.db.setProfile(ctx.guildId, ctx.user.id, profile.value);
            }
            await ctx.editReply({
                embeds,
                files: [attachment],
                components: game.buildRows(true)
            });
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => builder
            .setName(this.name)
            .setDescription(this.description));
    }
    makeEmbed(content) {
        return new discord_js_1.MessageEmbed()
            .setDescription(content)
            .setColor(config_1.embedColor);
    }
};
MatchMeCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "matchme",
        description: "Challenge me to play tictactoe",
        preconditions: ["allowMaintenance", "GuildOnly"]
    })
], MatchMeCommand);
exports.MatchMeCommand = MatchMeCommand;
