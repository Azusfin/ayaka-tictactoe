"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRoles = exports.defaultProfile = exports.AyakaDatabase = void 0;
const aoi_mongo_1 = require("aoi.mongo");
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
class AyakaDatabase {
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
}
exports.AyakaDatabase = AyakaDatabase;
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
            }
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
