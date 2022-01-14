import { Cursor, Doc, Mongo } from "aoi.mongo";
import { DeleteResult, MongoClient, UpdateResult } from "mongodb";
import { mongoDatabase, mongoURL } from "../config";
import { Themes } from "../utils/Themes";

export class AyakaDatabase {
    private profile!: Mongo<TictactoeProfile>
    private roles!: Mongo<TictactoeRoles>

    public profileCache = new Map<string, Cache<Doc<TictactoeProfile>>>()
    public rolesCache = new Map<string, Cache<Doc<TictactoeRoles>>>()

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

    public getProfile(guild: string, user: string): Promise<Doc<TictactoeProfile> | null> {
        return this.cacheOrFetch(`${guild}-${user}`, this.profileCache, this.profile)
    }

    public setProfile(guild: string, user: string, profile: TictactoeProfile): Promise<UpdateResult> {
        const key = `${guild}-${user}`

        this.deleteCache(key, this.profileCache)
        return this.profile.set(key, profile)
    }

    public deleteProfile(guild: string, user: string): Promise<DeleteResult> {
        const key = `${guild}-${user}`

        this.deleteCache(key, this.profileCache)
        return this.profile.delete(key)
    }

    public deleteProfiles(guild: string): Promise<DeleteResult> {
        for (const [key, cache] of this.profileCache) {
            if (!key.startsWith(guild)) continue

            clearTimeout(cache.timeout)
            this.profileCache.delete(key)
        }

        const regex = new RegExp(`${guild}-\\d{17,19}`)

        return this.profile.query(
            this.profile.filter()
                .key.match(regex)
        ).deleteMulti()
    }

    public matchProfiles(guild: string): Promise<Cursor<TictactoeProfile>> {
        const regex = new RegExp(`${guild}-\\d{17,19}`)
        return this.profile.match(regex)
    }

    public allProfiles(): Promise<Cursor<TictactoeProfile>> {
        return this.profile.all()
    }

    public getRoles(guild: string): Promise<Doc<TictactoeRoles> | null> {
        return this.cacheOrFetch(guild, this.rolesCache, this.roles)
    }

    public setRoles(guild: string, roles: TictactoeRoles): Promise<UpdateResult> {
        this.deleteCache(guild, this.rolesCache)
        return this.roles.set(guild, roles)
    }

    public deleteRoles(guild: string): Promise<DeleteResult> {
        this.deleteCache(guild, this.rolesCache)
        return this.roles.delete(guild)
    }

    private async cacheOrFetch<T>(
        key: string,
        cacher: Map<string, Cache<Doc<T>>>,
        mongo: Mongo<T>
    ): Promise<Doc<T> | null> {
        let cache = cacher.get(key)

        if (cache?.timeout) clearTimeout(cache.timeout)

        if (!cache) {
            const data = await mongo.get(key)

            if (!data) return null

            cache = {
                doc: data,
                timeout: this.deleteCacheTimeout(key, cacher)
            }
        } else {
            cache.timeout = this.deleteCacheTimeout(key, cacher)
        }

        cacher.set(key, cache)

        return cache.doc
    }

    private deleteCacheTimeout<T>(key: string, cacher: Map<string, Cache<Doc<T>>>): NodeJS.Timeout {
        return setTimeout(() => {
            cacher.delete(key)
        }, 300e3)
    }

    private deleteCache<T>(key: string, cacher: Map<string, Cache<Doc<T>>>): void {
        const cache = cacher.get(key)

        if (!cache) return

        clearTimeout(cache.timeout)
        cacher.delete(key)
    }
}

export const db = new AyakaDatabase()

export interface Cache<T> {
    doc: T
    timeout: NodeJS.Timeout
}

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
