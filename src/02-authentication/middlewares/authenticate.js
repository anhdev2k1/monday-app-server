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
exports.authenticateV2 = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const catchAsync_1 = require("../../root/utils/catchAsync");
const error_response_1 = require("../../root/responseHandler/error.response");
const user_1 = __importDefault(require("../../models/user"));
exports.authenticate = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //TODO 1: Get accessToken from cookies
        // const accessTokenWithBearer = req.headers[HEADER.AUTHORIZATION] as string;
        // if (!accessTokenWithBearer) throw new AuthFailureError('Invalid request');
        const userId = req.headers['client-id'];
        if (!userId)
            throw new error_response_1.AuthFailureError(`Id's user is missing in header request`);
        // const accessToken = accessTokenWithBearer.split(' ')[1];
        // if (!accessToken) throw new AuthFailureError('Invalid request');
        const { accessToken } = req.cookies;
        if (!accessToken)
            throw new error_response_1.AuthFailureError('Invalid request');
        //TODO 2: Decode token
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_KEY);
        if (decoded.userId !== userId)
            throw new error_response_1.AuthFailureError('Invalid userId');
        const foundUser = yield user_1.default.findById(decoded.userId);
        if (!foundUser)
            throw new error_response_1.AuthFailureError('This User is not belong token! Please log in again');
        if (!foundUser.isVerified)
            throw new error_response_1.AuthFailureError(`This account have't verify code! Please sign-up again`);
        req.user = foundUser;
        return next();
    }
    catch (err) {
        const error = err;
        switch (error.name) {
            case 'TokenExpiredError':
                throw new error_response_1.AuthFailureError('Token has expired');
            case 'NotBeforeError':
                throw new error_response_1.AuthFailureError('Token is not yet valid');
            case 'JsonWebTokenError':
                throw new error_response_1.AuthFailureError('Token is invalid');
            default:
                throw err;
        }
    }
}));
exports.authenticateV2 = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('jwt', { session: false }, function (err, user) {
        if (err)
            return next(err);
        if (!user)
            throw new error_response_1.AuthFailureError('This user is not belong this token! Please log in again');
        const userId = req.headers['client-id'];
        if (!userId)
            throw new error_response_1.AuthFailureError(`Id's user is missing in header request`);
        if (user._id.toString() !== userId)
            throw new error_response_1.AuthFailureError('Invalid userId');
        req.user = user;
        next();
    })(req, res, next);
}));
