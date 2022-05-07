import { SapphireClient } from "@sapphire/framework";

export class AyakaClient extends SapphireClient {
    constructor() {
        super({ intents: ["GUILDS"] })
    }
}
