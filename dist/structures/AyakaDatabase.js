"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRoles = exports.defaultProfile = exports.db = exports.AyakaDatabase = void 0;
const aoi_mongo_1 = require("aoi.mongo");
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
class AyakaDatabase {
    constructor() {
        this.profileCache = new Map();
        this.rolesCache = new Map();
    }
    async connect() {
        if (this.profile ||
            this.roles)
            return;
        const mongoClient = new mongodb_1.MongoClient(config_1.mongoURL, {
            keepAlive: true,
            maxPoolSize: 35
        });
        const client = await mongoClient.connect();
        this.profile = new aoi_mongo_1.Mongo({
            client,
            dbName: config_1.mongoDatabase,
            collectionName: "profile"
        });
        this.roles = new aoi_mongo_1.Mongo({
            client,
            dbName: config_1.mongoDatabase,
            collectionName: "roles"
        });
    }
    getProfile(guild, user) {
        return this.cacheOrFetch(`${guild}-${user}`, this.profileCache, this.profile);
    }
    setProfile(guild, user, profile) {
        const key = `${guild}-${user}`;
        this.deleteCache(key, this.profileCache);
        return this.profile.set(key, profile);
    }
    deleteProfile(guild, user) {
        const key = `${guild}-${user}`;
        this.deleteCache(key, this.profileCache);
        return this.profile.delete(key);
    }
    deleteProfiles(guild) {
        for (const [key, cache] of this.profileCache) {
            if (!key.startsWith(guild))
                continue;
            clearTimeout(cache.timeout);
            this.profileCache.delete(key);
        }
        const regex = new RegExp(`${guild}-\\d{17,19}`);
        return this.profile.query(this.profile.filter()
            .key.match(regex)).deleteMulti();
    }
    matchProfiles(guild) {
        const regex = new RegExp(`${guild}-\\d{17,19}`);
        return this.profile.match(regex);
    }
    allProfiles() {
        return this.profile.all();
    }
    getRoles(guild) {
        return this.cacheOrFetch(guild, this.rolesCache, this.roles);
    }
    setRoles(guild, roles) {
        this.deleteCache(guild, this.rolesCache);
        return this.roles.set(guild, roles);
    }
    deleteRoles(guild) {
        this.deleteCache(guild, this.rolesCache);
        return this.roles.delete(guild);
    }
    async cacheOrFetch(key, cacher, mongo) {
        let cache = cacher.get(key);
        if (cache?.timeout)
            clearTimeout(cache.timeout);
        if (!cache) {
            const data = await mongo.get(key);
            if (!data)
                return null;
            cache = {
                doc: data,
                timeout: this.deleteCacheTimeout(key, cacher)
            };
        }
        else {
            cache.timeout = this.deleteCacheTimeout(key, cacher);
        }
        cacher.set(key, cache);
        return cache.doc;
    }
    deleteCacheTimeout(key, cacher) {
        return setTimeout(() => {
            cacher.delete(key);
        }, 300e3);
    }
    deleteCache(key, cacher) {
        const cache = cacher.get(key);
        if (!cache)
            return;
        clearTimeout(cache.timeout);
        cacher.delete(key);
    }
}
exports.AyakaDatabase = AyakaDatabase;
exports.db = new AyakaDatabase();
function defaultProfile(guild, user) {
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
            },
            dailyStreak: 0,
            lastDaily: new Date(0)
        }
    };
}
exports.defaultProfile = defaultProfile;
function defaultRoles(guild) {
    return {
        key: guild,
        value: new Map()
    };
}
exports.defaultRoles = defaultRoles;
