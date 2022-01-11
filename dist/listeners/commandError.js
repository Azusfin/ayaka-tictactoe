"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandErrorEvent = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
let CommandErrorEvent = class CommandErrorEvent extends framework_1.Listener {
    run(_, { interaction, command }) {
        this.container.logger.error("Command Error:", command.name, "-", "User:", interaction.user.id, "-", "Channel:", interaction.channel?.id ?? "DM", "-", "Guild:", interaction.guild?.id ?? "N/A");
        const embed = new discord_js_1.MessageEmbed()
            .setDescription("There's an error when running the command")
            .setColor(config_1.embedColor);
        if (!interaction.deferred) {
            void interaction.reply({
                ephemeral: true,
                embeds: [embed]
            });
        }
        else {
            void interaction.editReply({ content: null, embeds: [embed], components: [] });
        }
    }
};
CommandErrorEvent = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "chatInputCommandError"
    })
], CommandErrorEvent);
exports.CommandErrorEvent = CommandErrorEvent;
