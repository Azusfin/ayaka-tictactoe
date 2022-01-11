import { Doc, Mongo } from "aoi.mongo";
import { MongoClient } from "mongodb";
import { mongoDatabase, mongoURL } from "../config";

export class AyakaDatabase {
    public profile!: Mongo<TictactoeProfile>

    public async connect(): Promise<void> {
        if (this.profile) return

        const mongoClient = new MongoClient(mongoURL, { maxPoolSize: 35 })
        const client = await mongoClient.connect()
        const mongo = new Mongo<TictactoeProfile>({
            client,
            dbName: mongoDatabase,
            collectionName: "profile"
        })

        this.profile = mongo
    }
}

export interface TictactoeProfile {
    bio: string
    points: number
    streak: number
    badges: string[]
    theme: TictactoeProfileTheme
}

export interface TictactoeProfileTheme {
    used: string
    themes: string[]
}

export function defaultProfile(guild: string, user: string): Doc<TictactoeProfile> {
    return {
        key: `${guild}-${user}`,
        value: {
            bio: "",
            points: 0,
            streak: 0,
            badges: [],
            theme: {
                used: "Ayaka",
                themes: ["Ayaka"]
            }
        }
    }
}
