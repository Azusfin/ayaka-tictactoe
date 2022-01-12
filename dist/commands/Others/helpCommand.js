"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../utils/Util");
let HelpCommand = class HelpCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const cmdName = interaction.options.getString("command");
        const cmdStore = this.container.stores.get("commands");
        if (!cmdName) {
            const categories = new discord_js_1.Collection();
            for (const cmd of cmdStore.values()) {
                const category = cmd.category ?? "No Category";
                const cmds = categories.get(category) ?? [];
                cmds.push(cmd);
                categories.set(category, cmds);
            }
            const fields = categories.map((cmds, category) => ({
                name: category,
                value: `\`${cmds.map(cmd => cmd.name).join("`, `")}\``
            }));
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Commands List")
                .setDescription("You can type `/<command-name>` to use the command\n" +
                "`/help <command-name>` to show more info about a command")
                .addFields(fields)
                .setColor(config_1.embedColor);
            await interaction.reply({
                ephemeral: true,
                embeds: [embed]
            });
            return;
        }
        const lowercaseCmd = cmdName.toLowerCase();
        const cmd = cmdStore.find(cmd => cmd.name === lowercaseCmd);
        if (!cmd) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setTitle("Not Found")
                        .setDescription(`No command found with name \`${cmdName}\``)
                        .setColor(config_1.embedColor)
                ]
            });
            return;
        }
        const name = cmd.name;
        const description = cmd.description;
        const usage = `/${name}${cmd.detailedDescription ? ` ${cmd.detailedDescription}` : ""}`;
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(name)
            .setDescription(description)
            .addFields({
            name: "Usage",
            value: usage
        })
            .setColor(config_1.embedColor);
        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        });
    }
    autocompleteRun(interaction) {
        const partialCmd = interaction.options.getString("command") ?? "";
        const lowercasePartialCmd = partialCmd.toLowerCase();
        const commandStore = this.container.stores.get("commands");
        const choices = [];
        for (const cmd of commandStore.values()) {
            if (cmd.name.includes(lowercasePartialCmd)) {
                choices.push({
                    name: cmd.name,
                    value: cmd.name
                });
            }
            if (choices.length >= 25)
                return;
        }
        void interaction.respond(choices);
    }
    registerApplicationCommands(registry) {
        (0, Util_1.register)(registry, builder => {
            builder.addStringOption(option => option
                .setName("command")
                .setDescription("The command to show the info to")
                .setRequired(false)
                .setAutocomplete(true));
            return builder
                .setName(this.name)
                .setDescription(this.description);
        });
    }
};
HelpCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "help",
        description: "Show a list of commands and specific info of a command",
        detailedDescription: "[command]"
    })
], HelpCommand);
exports.HelpCommand = HelpCommand;
