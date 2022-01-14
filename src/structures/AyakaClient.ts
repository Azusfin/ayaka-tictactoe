import { SapphireClient } from "@sapphire/framework";

export class AyakaClient extends SapphireClient {
    public constructor() {
        super({ intents: ["GUILDS"] })
    }
}
