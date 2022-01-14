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
        const games = Tictactoe_1.guildsGames.get(ctx.guildId) ?? new Map();
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
        const players = Math.round(Math.random())
            ? [ctx.user.id, user.id]
            : [user.id, ctx.user.id];
        const firstTurn = Math.random() > 0.5;
        game = new Tictactoe_1.Tictactoe(Themes_1.Ayaka, players, firstTurn);
        const authorProfile = (await AyakaDatabase_1.db.profile.get(`${ctx.guildId}-${ctx.user.id}`) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
        game.theme = (0, Themes_1.themeOf)(authorProfile.theme.used);
        let status = tic_tac_toe_minimax_engine_1.GameStatus.ONGOING;
        const mainImg = await game.draw();
        const mainAttachment = new discord_js_1.MessageAttachment(mainImg, "tictactoe.jpg");
        const mainEmbed = this.buildEmbed(game, status);
        await ctx.editReply({
            files: [mainAttachment],
            embeds: [mainEmbed],
            components: this.buildRows(game)
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 300e3,
            filter: button => (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING &&
                game.players.includes(button.user.id))
        });
        collector.on("collect", async (button) => {
            await button.deferUpdate();
            const index = parseInt(button.customId.split("-")[1]);
            const columnIndex = index % 3;
            const rowIndex = Math.floor(index / 3);
            if (game.cells[index] !== tic_tac_toe_minimax_engine_1.Cell.EMPTY)
                return;
            status = game.fill(rowIndex, columnIndex);
            const img = await game.draw();
            const attachment = new discord_js_1.MessageAttachment(img, "tictactoe.jpg");
            const embed = this.buildEmbed(game, status);
            await ctx.editReply({
                files: [attachment],
                embeds: [embed],
                components: this.buildRows(game)
            });
            if (status !== tic_tac_toe_minimax_engine_1.GameStatus.ONGOING)
                collector.stop();
        });
        collector.once("end", async () => {
            if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING)
                status = tic_tac_toe_minimax_engine_1.GameStatus.DRAW;
            const img = await game.draw(status);
            const attachment = new discord_js_1.MessageAttachment(img, "tictactoe.jpg");
            const embed = this.buildEmbed(game, status);
            const embeds = [embed];
            if (status !== tic_tac_toe_minimax_engine_1.GameStatus.DRAW) {
                const winner = game.players[game.playerID];
                const loser = game.players.find(id => id !== winner);
                const winnerProfile = await AyakaDatabase_1.db.profile.get(`${ctx.guildId}-${winner}`) ?? (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, winner);
                const loserProfile = await AyakaDatabase_1.db.profile.get(`${ctx.guildId}-${loser}`);
                if (loserProfile) {
                    loserProfile.value.streak = 0;
                    await AyakaDatabase_1.db.profile.set(`${ctx.guildId}-${loser}`, loserProfile.value);
                }
                const bonus = Math.floor(winnerProfile.value.streak * 1.45);
                winnerProfile.value.streak++;
                winnerProfile.value.points += 1 + bonus;
                await AyakaDatabase_1.db.profile.set(`${ctx.guildId}-${winner}`, winnerProfile.value);
                embeds.push(new discord_js_1.MessageEmbed()
                    .setDescription(`<@${winner}> Got 1 (+${bonus}) points\n` +
                    `<@${loser}> Lose their streak`)
                    .setColor(config_1.embedColor));
            }
            await ctx.editReply({
                embeds,
                files: [attachment],
                components: this.buildRows(game, true)
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
    buildRows(game, end = false) {
        const rows = [];
        for (let i = 0; i < game.cells.length; i += 3) {
            const row = new discord_js_1.MessageActionRow();
            for (let j = 0; j < 3; j++) {
                const index = i + j;
                const cell = game.cells[index];
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
        return rows;
    }
    buildEmbed(game, status) {
        const embed = new discord_js_1.MessageEmbed()
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
            .setColor(config_1.embedColor)
            .setImage("attachment://tictactoe.jpg");
        const player = game.players[game.playerID];
        if (status === tic_tac_toe_minimax_engine_1.GameStatus.ONGOING) {
            embed.addFields({
                name: "Turn",
                value: `<@${player}>`
            });
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
