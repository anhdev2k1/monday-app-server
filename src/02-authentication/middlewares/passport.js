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
exports.applyPassportStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const user_1 = __importDefault(require("../../models/user"));
const constant_1 = require("../constant");
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[constant_1.Tokens.ACCESS_TOKEN];
    }
    return token;
};
const applyPassportStrategy = (passport) => {
    const options = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.SECRET_KEY,
    };
    passport.use(new passport_jwt_1.Strategy(options, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const foundUser = yield user_1.default.findById(payload.userId);
            if (!foundUser)
                return done(null, false);
            return done(null, foundUser);
        }
        catch (error) {
            return done(error, false);
        }
    })));
};
exports.applyPassportStrategy = applyPassportStrategy;
