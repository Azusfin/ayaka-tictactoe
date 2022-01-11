"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultProfile = exports.AyakaDatabase = void 0;
const aoi_mongo_1 = require("aoi.mongo");
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
class AyakaDatabase {
    async connect() {
        if (this.profile)
            return;
        const mongoClient = new mongodb_1.MongoClient(config_1.mongoURL, { maxPoolSize: 35 });
        const client = await mongoClient.connect();
        const mongo = new aoi_mongo_1.Mongo({
            client,
            dbName: config_1.mongoDatabase,
            collectionName: "profile"
        });
        this.profile = mongo;
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
                themes: ["Ayaka"]
            }
        }
    };
}
exports.defaultProfile = defaultProfile;
