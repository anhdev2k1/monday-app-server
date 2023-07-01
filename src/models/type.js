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
const mongoose_1 = require("mongoose");
const constant_1 = require("../05-column/constant");
const db_1 = __importDefault(require("../root/db"));
const DOCUMENT_NAME = 'Type';
const COLLECTION_NAME = 'Types';
// Declare the Schema of the Mongo model
var typeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
typeSchema.static('createTypes', function createTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        const creatingMultipleValueTypes = Object.values(constant_1.multipleValueTypes).map((type) => this.create({ name: type.name, icon: type.icon, color: type.color }));
        const creatingSingleValueTypes = Object.values(constant_1.singleValueTypes).map((type) => this.create({ name: type.name, icon: type.icon, color: type.color }));
        yield Promise.all([...creatingMultipleValueTypes, ...creatingSingleValueTypes]);
    });
});
//Export the model
let Type;
if (process.env.STATUS === 'import') {
    Type = (0, mongoose_1.model)(DOCUMENT_NAME, typeSchema);
}
else {
    Type = db_1.default.model(DOCUMENT_NAME, typeSchema);
}
exports.default = Type;
