"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadyEvent = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
let ReadyEvent = class ReadyEvent extends framework_1.Listener {
    async run() {
        this.container.logger.info("Configurations Loaded");
        const developerID = await this.container.client.application.fetch();
        if (developerID.owner instanceof discord_js_1.Team) {
            for (const ownerID of developerID.owner.members.keys()) {
                if (!config_1.owners.includes(ownerID))
                    config_1.owners.push(ownerID);
            }
        }
        else if (!config_1.owners.includes(developerID.owner.id)) {
            config_1.owners.push(developerID.owner.id);
        }
        await Promise.all(config_1.owners.map(ownerID => this.container.client.users.fetch(ownerID, { cache: true }).catch(() => null)));
        this.container.logger.info("Application Info Fetched");
        this.container.client.user.setActivity({
            name: "💙 /help",
            type: "WATCHING"
        });
        this.container.logger.info("Activity Has Been Set");
        this.container.logger.info(`Logged In Client ${this.container.client.user.tag}`);
        this.container.logger.info("Connecting To Mongo Database...");
        const before = Date.now();
        await this.container.client.db.connect();
        this.container.logger.info("Connected To Mongo Database", "-", `Took ${Date.now() - before}ms to connect`);
    }
};
ReadyEvent = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "ready",
        once: true
    })
], ReadyEvent);
exports.ReadyEvent = ReadyEvent;
