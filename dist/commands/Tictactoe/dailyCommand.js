"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const config_1 = require("../../config");
const AyakaDatabase_1 = require("../../structures/AyakaDatabase");
const Util_1 = require("../../utils/Util");
const cooldown = 20 * 60 * 60 * 1000;
const streakLimit = 24 * 60 * 60 * 1000;
const dailyMin = 16;
const dailyMax = 34;
let DailyCommand = class DailyCommand extends framework_1.Command {
    async chatInputRun(ctx) {
        await ctx.deferReply({ ephemeral: true });
        const current = new Date();
        const profile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
        const gap = current.getTime() - profile.lastDaily.getTime();
        if (gap < cooldown) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`You can only claim daily reward every ${(0, humanize_duration_1.default)(cooldown)}\n` +
                        `Please wait \`${(0, humanize_duration_1.default)(cooldown - gap, { maxDecimalPoints: 0 })}\` more`)]
            });
            return;
        }
        const embeds = [];
        if (profile.lastDaily.getFullYear() > 2015 && gap > streakLimit) {
            embeds.push(this.makeEmbed(`You hit max time limit from your last daily, you lose your \`${profile.dailyStreak}\` daily streak\n` +
                `You last claimed your daily on <t:${Math.floor(profile.lastDaily.getTime() / 1000)}>`));
            profile.dailyStreak = 0;
        }
        const amount = Math.floor((Math.random() * (dailyMax - dailyMin + 1)) + dailyMin);
        const bonus = Math.floor(profile.dailyStreak / dailyMin * amount);
        profile.points += amount + bonus;
        profile.lastDaily = current;
        embeds.push(this.makeEmbed(`Claimed ${amount} (+${bonus}) points\n` +
            `You now have a total of ${profile.points.toLocaleString("en-us")} points\n`).setFooter({
            text: `Daily streak: ${profile.dailyStreak}`
        }));
        profile.dailyStreak++;
        await AyakaDatabase_1.db.setProfile(ctx.guildId, ctx.user.id, profile);
        await ctx.editReply({ embeds });
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
DailyCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "daily",
        description: "Claim your daily rewards",
        preconditions: ["allowMaintenance", "GuildOnly"]
    })
], DailyCommand);
exports.DailyCommand = DailyCommand;
