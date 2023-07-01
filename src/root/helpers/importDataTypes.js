"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const mongoose_1 = __importDefault(require("mongoose"));
const type_1 = __importDefault(require("../../models/type"));
// import { config } from '../configs';
// const { password, name } = config.db;
// const uri = `mongodb+srv://monday:${password}@cluster0.gzcsvxt.mongodb.net/${name}?retryWrites=true&w=majority`;
const uri = `mongodb://192.168.1.15:27018/mondayDEV`;
// const uri = `mongodb://192.168.0.106:27018`;
mongoose_1.default
    .connect(uri)
    .then(() => console.log(`Connect to DB successfully`))
    .catch((error) => console.error(error));
const importData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield type_1.default.createTypes();
        console.log('Import data successfully');
    }
    catch (error) {
        console.error(error);
    }
    process.exit();
});
importData();
