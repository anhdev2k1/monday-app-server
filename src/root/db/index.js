"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const configs_1 = require("../configs");
class Database {
    constructor() {
        const { password, name } = configs_1.config.db;
        this.uri = `mongodb+srv://monday:${password}@cluster0.gzcsvxt.mongodb.net/${name}?retryWrites=true&w=majority`;
        // this.uri = `mongodb://192.168.1.15:27018/mondayDEV`;
        // this.uri = `mongodb://192.168.0.106:27018/mondayDEV`;
        if (configs_1.config.env === 'dev') {
            mongoose_1.default.set('debug', true);
            mongoose_1.default.set('debug', { color: true });
        }
        this.db = mongoose_1.default.createConnection(this.uri, {
            maxPoolSize: 10,
        });
        this.db.on('open', () => console.log('Connected to mongoDB server successfully'));
        this.db.on('error', (error) => console.error('Connection failed', error));
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }
}
const instanceDB = Database.getInstance();
exports.default = instanceDB.db;
