import { SapphireClient } from "@sapphire/framework";
import { AyakaDatabase } from "./AyakaDatabase";

export class AyakaClient extends SapphireClient {
    public db = new AyakaDatabase()

    public constructor() {
        super({ intents: ["GUILDS"] })
    }
}

declare module "@sapphire/framework" {
    export interface SapphireClient {
        db: AyakaDatabase
    }
}
