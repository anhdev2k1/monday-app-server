"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const db_1 = __importDefault(require("../root/db"));
const DOCUMENT_NAME = 'UserProfile';
const COLLECTION_NAME = 'UserProfiles';
// Declare the Schema of the Mongo model
var userProfileSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'User must have name'],
    },
    title: {
        type: String,
    },
    phone: {
        type: String,
        validate: {
            validator: function (el) {
                return el.length === 10;
            },
        },
    },
    birthday: Date,
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
//Export the model
const UserProfile = db_1.default.model(DOCUMENT_NAME, userProfileSchema);
exports.default = UserProfile;
