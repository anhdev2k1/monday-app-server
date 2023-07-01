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
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../root/db"));
const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'Users';
// Declare the Schema of the Mongo model
var userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: [validator_1.default.isEmail, 'Email is wrong format'],
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    code: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    expiresIn: {
        type: Date,
        default: null,
    },
    userProfile: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        next();
    });
});
userSchema.method('isMatchPassword', function isMatchPassword(passwordInputed) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(passwordInputed, this.password);
    });
});
userSchema.method('generateCode', function generateCode() {
    const code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();
    const codeLifeTimeMinutes = 5;
    const expiresIn = new Date(Date.now() + codeLifeTimeMinutes * 60 * 1000);
    return { code, codeLifeTimeMinutes, expiresIn };
});
userSchema.method('generateTokens', function generateTokens() {
    const payload = {
        userId: this._id.toString(),
        email: this.email,
    };
    const accessTokenLifeTimeHours = 12;
    const refreshTokenLifeTimeDays = 1;
    const keySecret = process.env.SECRET_KEY;
    const accessToken = jsonwebtoken_1.default.sign(payload, keySecret, {
        expiresIn: `${accessTokenLifeTimeHours}h`,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, keySecret, {
        expiresIn: `${refreshTokenLifeTimeDays}d`,
    });
    return {
        accessToken,
        refreshToken,
        accessTokenLifeTime: (accessTokenLifeTimeHours + 7) * 60 * 60 * 1000,
        refreshTokenLifeTime: (refreshTokenLifeTimeDays + 7 / 24) * 24 * 60 * 60 * 1000,
    };
});
userSchema.static('findByEmail', function findByEmail({ email, selectOptions = {
    email: 1,
    password: 1,
    code: 1,
    isVerified: 1,
    expiresIn: 1,
    userProfile: 1,
}, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOne({ email }).select(selectOptions);
    });
});
//Export the model
const User = db_1.default.model(DOCUMENT_NAME, userSchema);
exports.default = User;
