"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const AyakaDatabase_1 = require("../../structures/AyakaDatabase");
const Util_1 = require("../../utils/Util");
const validInteger = /^\d+$/;
let GiveCommand = class GiveCommand extends framework_1.Command {
    async chatInputRun(ctx) {
        const user = ctx.options.getUser("user", true);
        const amount = ctx.options.getInteger("amount", true);
        await ctx.deferReply();
        const profile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
        if (amount > profile.points) {
            await ctx.editReply({
                embeds: [this.makeEmbed(`You cannot give them more than what you have\n` +
                        `Current Points: ${profile.points.toLocaleString("en-us")}\n` +
                        `Amount To GIve: ${amount.toLocaleString("en-us")}`)]
            });
            return;
        }
        const targetProfile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, user.id)).value;
        const before = profile.points;
        const targetBefore = targetProfile.points;
        profile.points -= amount;
        targetProfile.points += amount;
        await Promise.all([
            AyakaDatabase_1.db.setProfile(ctx.guildId, ctx.user.id, profile),
            AyakaDatabase_1.db.setProfile(ctx.guildId, user.id, targetProfile)
        ]);
        await ctx.editReply({
            embeds: [this.makeEmbed(`Amount: ${amount.toLocaleString("en-us")}\n` +
                    `<@${ctx.user.id}>: ${before.toLocaleString("en-us")} -> ${profile.points.toLocaleString("en-us")}\n` +
                    `<@${user.id}>: ${targetBefore.toLocaleString("en-us")} -> ${targetProfile.points.toLocaleString("en-us")}`)]
        });
    }
    async autocompleteRun(ctx) {
        const amount = ctx.options.getFocused();
        const lowercaseAmount = amount.toLowerCase();
        if (ctx.guildId &&
            ((amount !== "" &&
                "all".startsWith(lowercaseAmount)) ||
                (validInteger.test(amount) &&
                    parseInt(amount) > 0))) {
            const profile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, ctx.user.id) ??
                (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, ctx.user.id)).value;
            const choices = [{ name: "all", value: profile.points }];
            if (validInteger.test(amount)) {
                choices.unshift({
                    name: amount,
                    value: parseInt(amount)
                });
            }
            await ctx.respond(choices);
        }
        else {
            await ctx.respond([]);
        }
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => {
            builder.addUserOption(option => option
                .setName("user")
                .setDescription("The user to give the points to")
                .setRequired(true));
            builder.addIntegerOption(option => option
                .setName("amount")
                .setDescription("The amount of points to give to")
                .setRequired(true)
                .setMinValue(1)
                .setAutocomplete(true));
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
GiveCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "give",
        description: "Give some points to another user",
        preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
    })
], GiveCommand);
exports.GiveCommand = GiveCommand;
