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
const db_1 = __importDefault(require("../root/db"));
const constant_1 = __importDefault(require("../08-value/constant"));
const DOCUMENT_NAME = 'DefaultValue';
const COLLECTION_NAME = 'DefaultValues';
// Declare the Schema of the Mongo model
var defaultValueSchema = new mongoose_1.Schema({
    value: {
        type: String,
        default: null,
    },
    color: {
        type: String,
        required: true,
        default: '#797e93',
    },
    canEditColor: {
        type: Boolean,
        default: true,
    },
    belongType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Type',
    },
    belongBoard: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Board',
        default: null,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
defaultValueSchema.static('createNewDefaultValuesByColumn', function createNewDefaultValuesByColumn({ boardId, typeDoc, createdBy, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultValuesOfType = constant_1.default[typeDoc.name];
        if (defaultValuesOfType) {
            const convertedToDefaultValues = defaultValuesOfType.map((defaultValue) => (Object.assign(Object.assign({}, defaultValue), { belongType: typeDoc._id, belongBoard: boardId, createdBy })));
            const insertedDefaultValues = yield DefaultValue.insertMany(convertedToDefaultValues, {
                session,
            });
            return insertedDefaultValues;
        }
        return [];
    });
});
let DefaultValue;
if (process.env.STATUS === 'import') {
    DefaultValue = (0, mongoose_1.model)(DOCUMENT_NAME, defaultValueSchema);
}
else {
    DefaultValue = db_1.default.model(DOCUMENT_NAME, defaultValueSchema);
}
exports.default = DefaultValue;
