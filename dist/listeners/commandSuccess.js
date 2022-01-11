"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandSuccessEvent = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
let CommandSuccessEvent = class CommandSuccessEvent extends framework_1.Listener {
    run({ interaction, command }) {
        this.container.logger.info("Command Success:", command.name, "-", "User:", interaction.user.id, "-", "Channel:", interaction.channel?.id ?? "DM", "-", "Guild:", interaction.guild?.id ?? "N/A");
    }
};
CommandSuccessEvent = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "chatInputCommandSuccess"
    })
], CommandSuccessEvent);
exports.CommandSuccessEvent = CommandSuccessEvent;
