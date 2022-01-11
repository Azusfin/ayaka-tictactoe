"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../utils/Util");
let PingCommand = class PingCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Pong! 🏓")
            .addFields({ name: "WS", value: `${this.container.client.ws.ping}ms`, inline: true })
            .setColor(config_1.embedColor);
        const before = Date.now();
        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        });
        embed.addFields({ name: "REST", value: `${Date.now() - before}ms`, inline: true });
        await interaction.editReply({
            embeds: [embed]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => builder
            .setName(this.name)
            .setDescription(this.description));
    }
};
PingCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "ping",
        description: "Ping pong 🏓"
    })
], PingCommand);
exports.PingCommand = PingCommand;
