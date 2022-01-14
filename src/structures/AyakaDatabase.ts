import { Doc, Mongo } from "aoi.mongo";
import { MongoClient } from "mongodb";
import { mongoDatabase, mongoURL } from "../config";
import { Themes } from "../utils/Themes";

export class AyakaDatabase {
    public profile!: Mongo<TictactoeProfile>
    public roles!: Mongo<TictactoeRoles>

    public async connect(): Promise<void> {
        if (
            this.profile ||
            this.roles
        ) return

        const mongoClient = new MongoClient(mongoURL, {
            keepAlive: true,
            maxPoolSize: 35
        })

        const client = await mongoClient.connect()

        this.profile = new Mongo({
            client,
            dbName: mongoDatabase,
            collectionName: "profile"
        })

        this.roles = new Mongo({
            client,
            dbName: mongoDatabase,
            collectionName: "roles"
        })
    }
}

export const db = new AyakaDatabase()

export interface TictactoeProfile {
    bio: string
    points: number
    streak: number
    badges: string[]
    theme: TictactoeProfileTheme
    lastDaily?: Date
}

export interface TictactoeProfileTheme {
    used: Themes
    owned: Themes[]
}

export type TictactoeRoles = Map<string, TictactoeRole>

export interface TictactoeRole {
    id: string
    name: string
    description: string
    price: number
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
                owned: ["Ayaka"]
            }
        }
    }
}

export function defaultRoles(guild: string): Doc<TictactoeRoles> {
    return {
        key: guild,
        value: new Map()
    }
}
