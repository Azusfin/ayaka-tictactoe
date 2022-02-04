"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const tic_tac_toe_minimax_engine_1 = require("tic-tac-toe-minimax-engine");
const config_1 = require("../../config");
const AyakaDatabase_1 = require("../../structures/AyakaDatabase");
const Themes_1 = require("../../utils/Themes");
const Tictactoe_1 = require("../../utils/Tictactoe");
const Util_1 = require("../../utils/Util");
let MatchCommand = class MatchCommand extends framework_1.Command {
    async chatInputRun(ctx) {
        const user = ctx.options.getUser("user", true);
        if (user.id === ctx.user.id) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("You can't play with yourself, try play with me dear")]
            });
            return;
        }
        let games = Tictactoe_1.guildsGames.get(ctx.guildId) ?? new Map();
        let game = games.get(ctx.user.id);
        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)]
            });
            return;
        }
        game = games.get(user.id);
        if (game) {
            await ctx.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(`They still had a game with <@${game.players.find(id => id !== user.id)}>`)]
            });
            return;
        }
        const msg = await ctx.reply({
            fetchReply: true,
            embeds: [this.makeEmbed(`<@${user.id}> Do you accept this challenge?`)],
            components: [
                new discord_js_1.MessageActionRow()
                    .addComponents(new discord_js_1.MessageButton()
                    .setLabel("✅")
                    .setCustomId("match-accept")
                    .setStyle("SUCCESS"), new discord_js_1.MessageButton()
                    .setLabel("❌")
                    .setCustomId("match-decline")
                    .setStyle("DANGER"))
            ]
        });
        try {
            const button = await msg.awaitMessageComponent({
                componentType: "BUTTON",
                time: 30e3,
                filter(button) {
                    return button.user.id === user.id;
                }
            });
            await button.deferUpdate();
            const accepted = button.customId === "match-accept";
            if (!accepted) {
                await ctx.editReply({
                    embeds: [this.makeEmbed(`<@${user.id}> Declined the request`)],
                    components: []
                });
                return;
            }
        }
        catch {
            await ctx.editReply({
                embeds: [this.makeEmbed(`<@${user.id}> Took too long to respond`)],
                components: []
            });
            return;
        }
        games = Tictactoe_1.guildsGames.get(ctx.guildId) ?? new Map();
        game = games.get(ctx.user.id);
        if (game) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`You still had a game with <@${game.players.find(id => id !== ctx.user.id)}>`)],
                components: []
            });
            return;
        }
        game = games.get(user.id);
        if (game) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`They still had a game with <@${game.players.find(id => id !== user.id)}>`)],
                components: []
            });
            return;
        }
        const players = Math.round(Math.random())
            ? [ctx.user.id, user.id]
            : [user.id, ctx.user.id];
        const firstTurn = Math.random() > 0.5;
        game = new Tictactoe_1.Tictactoe(Themes_1.Ayaka, players, firstTurn);
        games.set(ctx.user.id, game);
        games.set(user.id, game);
        Tictactoe_1.guildsGames.set(ctx.guildId, games);
        const authorProfile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
        game.theme = (0, Themes_1.themeOf)(authorProfile.theme.used);
        let status = tic_tac_toe_minimax_engine_1.GameStatus.ONGOING;
        const mainAttachment = await game.buildImg();
        const mainEmbed = game.buildEmbed(status);
        await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: game.buildRows()
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => (button.customId !== "tictactoe-end"
                ? status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING &&
                    game.players[game.playerID] === button.user.id
                : game.players.includes(button.user.id))
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
            const attachment = await game.buildImg();
            const embed = game.buildEmbed(status);
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
            games.delete(user.id);
            Tictactoe_1.guildsGames.set(ctx.guildId, games);
            const attachment = await game.buildImg(status);
            const embed = game.buildEmbed(status);
            const embeds = [embed];
            if (status !== tic_tac_toe_minimax_engine_1.GameStatus.DRAW) {
                const winner = game.players[game.playerID];
                const loser = game.players.find(id => id !== winner);
                const winnerProfile = await AyakaDatabase_1.db.getProfile(ctx.guildId, winner) ??
                    (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, winner);
                const loserProfile = await AyakaDatabase_1.db.getProfile(ctx.guildId, loser);
                if (loserProfile) {
                    loserProfile.value.streak = 0;
                    await AyakaDatabase_1.db.setProfile(ctx.guildId, loser, loserProfile.value);
                }
                const bonus = Math.floor(winnerProfile.value.streak * 1.45);
                winnerProfile.value.points += 1 + bonus;
                embeds.push(this.makeEmbed(`<@${winner}> Got 1 (+${bonus}) points\n` +
                    `<@${winner}> Now have a total of ${winnerProfile.value.points.toLocaleString("en-us")} points\n` +
                    `<@${winner}> Streak: ${winnerProfile.value.streak}\n` +
                    `<@${loser}> Lose their streak`));
                winnerProfile.value.streak++;
                await AyakaDatabase_1.db.setProfile(ctx.guildId, winner, winnerProfile.value);
            }
            await ctx.editReply({
                embeds,
                files: [attachment],
                components: game.buildRows(true)
            });
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => {
            builder
                .addUserOption(option => option
                .setName("user")
                .setDescription("The user to match to")
                .setRequired(true));
            return builder
                .setName(this.name)
                .setDescription(this.description);
        });
    }
    makeEmbed(content) {
        return new discord_js_1.MessageEmbed()
            .setDescription(content)
            .setColor(config_1.embedColor);
    }
};
MatchCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "match",
        description: "Challenge someone to play tictactoe",
        detailedDescription: "<user>",
        preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
    })
], MatchCommand);
exports.MatchCommand = MatchCommand;
