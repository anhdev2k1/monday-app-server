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
const nodemailer_1 = __importDefault(require("nodemailer"));
const configs_1 = require("../root/configs");
const error_response_1 = require("../root/responseHandler/error.response");
const utils_1 = require("../root/utils");
const performTransaction_1 = require("../root/utils/performTransaction");
const constant_1 = require("./constant");
const user_1 = __importDefault(require("../models/user"));
const userProfile_1 = __importDefault(require("../models/userProfile"));
const workspace_1 = __importDefault(require("../models/workspace"));
class AccessService {
    static logout(res) {
        res.clearCookie(constant_1.Tokens.ACCESS_TOKEN);
        res.clearCookie(constant_1.Tokens.REFRESH_TOKEN);
        return null;
    }
    static signIn({ email, password }, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield this.getAndValidateUser({ email, password });
            if (!foundUser.isVerified)
                throw new error_response_1.BadRequestError(`User haven't verify code! Try sign-up or verify code again`);
            const isMatchPassword = yield foundUser.isMatchPassword(password);
            if (!isMatchPassword)
                throw new error_response_1.BadRequestError('Password is not correct');
            return this.sendResToClient({ Doc: foundUser, fields: ['_id', 'email', 'userProfile'] }, res);
        });
    }
    static verifyCode({ email, code }, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield user_1.default.findByEmail({ email });
            if (!foundUser)
                throw new error_response_1.NotFoundError('User is not found');
            if (foundUser.isVerified)
                throw new error_response_1.BadRequestError('User is verified');
            if (foundUser.code !== code)
                throw new error_response_1.BadRequestError('Code is invalid');
            const isValid = Number(new Date(foundUser.expiresIn)) - Date.now();
            if (isValid < 0)
                throw new error_response_1.BadRequestError('Code is expired! Please re-sent code again');
            yield foundUser.updateOne({
                $set: {
                    code: null,
                    expiresIn: null,
                    isVerified: true,
                },
            });
            yield workspace_1.default.create({
                name: 'Main Workspace',
                createdBy: foundUser._id,
                isMain: true,
            });
            return this.sendResToClient({ Doc: foundUser, fields: ['_id', 'email', 'userProfile'] }, res);
        });
    }
    static sendCodeAgain({ email }) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield user_1.default.findByEmail({ email });
            if (!foundUser)
                throw new error_response_1.NotFoundError('User is not found');
            if (foundUser.isVerified)
                throw new error_response_1.BadRequestError('User is verified');
            const { code, codeLifeTimeMinutes, expiresIn } = foundUser.generateCode();
            yield foundUser.updateOne({
                $set: {
                    code: code,
                    expiresIn: expiresIn,
                },
            });
            return this.sendGmail({ email, code, codeLifeTimeMinutes });
        });
    }
    static signUp({ name, email, password }, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, performTransaction_1.performTransaction)((session) => __awaiter(this, void 0, void 0, function* () {
                //TODO 1: Check if email exist
                const foundUser = yield user_1.default.findByEmail({ email });
                //TODO 2: If exist => return error
                if (foundUser)
                    throw new error_response_1.BadRequestError('User is already registered');
                //TODO 3: Create new User
                const [newUserProfile] = yield userProfile_1.default.create([{ name }], { session });
                const [newUser] = yield user_1.default.create([
                    {
                        email,
                        password,
                        userProfile: {
                            name: newUserProfile.name,
                        },
                    },
                ], { session });
                yield workspace_1.default.create({
                    name: 'Main Workspace',
                    createdBy: newUser._id,
                    isMain: true,
                });
                //TODO 4: Create token -> send it to client
                return this.sendResToClient({ Doc: newUser, fields: ['_id', 'email', 'userProfile'] }, res);
            }));
        });
    }
    static getMe({ id }, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield user_1.default.findById(id);
            if (!foundUser)
                throw new error_response_1.NotFoundError('User is not exist');
            return this.sendResToClient({
                Doc: foundUser,
                fields: ['_id', 'email', 'userProfile'],
            }, res);
        });
    }
    static sendResToClient({ Doc, fields }, res) {
        const { accessToken, refreshToken, accessTokenLifeTime, refreshTokenLifeTime } = Doc.generateTokens();
        res.cookie(constant_1.Tokens.ACCESS_TOKEN, accessToken, {
            httpOnly: true,
            maxAge: accessTokenLifeTime,
        });
        res.cookie(constant_1.Tokens.REFRESH_TOKEN, refreshToken, {
            httpOnly: true,
            maxAge: refreshTokenLifeTime,
        });
        return {
            user: (0, utils_1.getInfodata)({
                fields,
                object: Doc,
            }),
        };
    }
    static sendGmail({ email, code, codeLifeTimeMinutes }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = yield configs_1.oAuth2Client.getAccessToken();
            const transporter = nodemailer_1.default.createTransport({
                host: 'smtp.gmail.com',
                service: 'gmail',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAUTH2',
                    user: 'nnthuan2000@gmail.com',
                    clientId: configs_1.config.email.clientId,
                    clientSecret: configs_1.config.email.clientSecret,
                    refreshToken: configs_1.config.email.refreshToken,
                    accessToken: (_a = accessToken.token) === null || _a === void 0 ? void 0 : _a.toString(),
                },
            });
            yield transporter.sendMail({
                from: '"Monday" <nnthuan2000@gmail.com',
                to: email,
                subject: 'Verify your email ✔',
                text: 'Hello world?',
                html: `<p>Your code: <b>${code}</b><br/>This email is only valid for ${codeLifeTimeMinutes} minutes</p>`, // html body
            });
        });
    }
    static getAndValidateUser({ email, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield user_1.default.findByEmail({ email });
            if (!foundUser)
                throw new error_response_1.NotFoundError('User is not registerd');
            const isCorrectPassword = foundUser.isMatchPassword(password);
            if (!isCorrectPassword)
                throw new error_response_1.BadRequestError('Password is incorrect');
            return foundUser;
        });
    }
}
exports.default = AccessService;
