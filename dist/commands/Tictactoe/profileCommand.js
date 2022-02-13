"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const AyakaDatabase_1 = require("../../structures/AyakaDatabase");
const Badges_1 = require("../../utils/Badges");
const Util_1 = require("../../utils/Util");
let ProfileCommand = class ProfileCommand extends framework_1.Command {
    async chatInputRun(ctx) {
        const user = ctx.options.getUser("user", true);
        await ctx.deferReply({ ephemeral: true });
        const profile = (await AyakaDatabase_1.db.getProfile(ctx.guildId, user.id) ??
            (0, AyakaDatabase_1.defaultProfile)(ctx.guildId, user.id)).value;
        const files = [];
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(user.tag)
            .setThumbnail(user.displayAvatarURL({ format: "png" }))
            .setColor(config_1.embedColor);
        if (profile.bio) {
            embed.addFields({
                name: "Bio",
                value: profile.bio
            });
        }
        embed.addFields({
            name: "Points",
            value: profile.points.toLocaleString("en-us"),
            inline: true
        }, {
            name: "Streak",
            value: profile.streak.toString(),
            inline: true
        }, {
            name: "Theme Used",
            value: profile.theme.used,
            inline: true
        });
        if (profile.badges.length) {
            const buffer = await (0, Badges_1.drawBadges)(profile.badges);
            const attachment = new discord_js_1.MessageAttachment(buffer, "badges.png");
            files.push(attachment);
            embed.setImage("attachment://badges.png");
        }
        await ctx.editReply({
            files,
            embeds: [embed]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => {
            builder
                .addUserOption(option => option
                .setName("user")
                .setDescription("The user to get the profile from")
                .setRequired(true));
            return builder
                .setName(this.name)
                .setDescription(this.description);
        });
    }
};
ProfileCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "profile",
        description: "Get profile info of a user",
        detailedDescription: "<user>",
        preconditions: ["allowMaintenance", "GuildOnly", "noBot"]
    })
], ProfileCommand);
exports.ProfileCommand = ProfileCommand;
